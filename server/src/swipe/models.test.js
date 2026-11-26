import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Profile } from './Profile.js'
import { Swipe } from './Swipe.js'
import { createMonotonicClock, isDuplicateKeyError, toProfile, toSwipeRecord } from './mongoSwipeRepository.js'

// These tests need no database: Mongoose validates documents in memory.

const PLAYER = '3f2c1a9e-8b4d-4e6f-9a1b-2c3d4e5f6a7b'
const goodSwipe = { playerId: PLAYER, profileId: 'mai-tran', action: 'LIKE', createdAt: new Date('2026-11-26T10:00:00.000Z') }
const goodProfile = { _id: 'mai-tran', name: 'Mai Tran', age: 27, bio: 'Sample bio.', order: 1 }

test('a valid swipe passes validation and gets a UUID _id from crypto.randomUUID', () => {
  const doc = new Swipe(goodSwipe)
  assert.equal(doc.validateSync(), undefined)
  assert.match(doc._id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
})

test('two new swipes get different ids', () => {
  assert.notEqual(new Swipe(goodSwipe)._id, new Swipe(goodSwipe)._id)
})

test('a swipe needs playerId, profileId, action and createdAt', () => {
  for (const field of ['playerId', 'profileId', 'action', 'createdAt']) {
    const { [field]: _omitted, ...rest } = goodSwipe
    const error = new Swipe(rest).validateSync()
    assert.ok(error?.errors[field], `${field} should be required`)
  }
})

test('a swipe action must be LIKE, NOPE or SUPERLIKE', () => {
  for (const action of ['like', 'UNDO', 'MAYBE', '']) {
    assert.ok(new Swipe({ ...goodSwipe, action }).validateSync()?.errors.action, action)
  }
  for (const action of ['LIKE', 'NOPE', 'SUPERLIKE']) {
    assert.equal(new Swipe({ ...goodSwipe, action }).validateSync(), undefined, action)
  }
})

test('playerId must be a UUID and profileId must match the id pattern', () => {
  assert.ok(new Swipe({ ...goodSwipe, playerId: 'abc' }).validateSync()?.errors.playerId)
  assert.ok(new Swipe({ ...goodSwipe, profileId: 'a b' }).validateSync()?.errors.profileId)
  assert.ok(new Swipe({ ...goodSwipe, profileId: 'a'.repeat(65) }).validateSync()?.errors.profileId)
})

test('unknown fields are stripped, so a forged property is never stored', () => {
  const stored = new Swipe({ ...goodSwipe, isAdmin: true, $set: { action: 'NOPE' } }).toObject()
  assert.ok(!('isAdmin' in stored))
  assert.equal(stored.action, 'LIKE')
})

test('the swipe schema has no updatedAt and no version key', () => {
  assert.equal(Swipe.schema.path('updatedAt'), undefined)
  assert.equal(Swipe.schema.path('__v'), undefined)
})

test('the swipe schema declares a unique index on (playerId, profileId)', () => {
  const indexes = Swipe.schema.indexes()
  const unique = indexes.find(([fields]) => fields.playerId === 1 && fields.profileId === 1)
  assert.ok(unique, 'compound index is missing')
  assert.equal(unique[1].unique, true)
})

test('the swipe schema has an index for reading one player history in order', () => {
  const indexes = Swipe.schema.indexes()
  assert.ok(indexes.some(([fields]) => fields.playerId === 1 && fields.createdAt === 1))
})

test('a valid profile passes and an invalid one fails', () => {
  assert.equal(new Profile(goodProfile).validateSync(), undefined)
  assert.ok(new Profile({ ...goodProfile, name: '' }).validateSync()?.errors.name)
  assert.ok(new Profile({ ...goodProfile, bio: 'x'.repeat(141) }).validateSync()?.errors.bio)
  assert.ok(new Profile({ ...goodProfile, age: 17 }).validateSync()?.errors.age)
  assert.ok(new Profile({ ...goodProfile, age: 27.5 }).validateSync()?.errors.age)
  assert.ok(new Profile({ ...goodProfile, order: undefined }).validateSync()?.errors.order)
})

test('toProfile maps a lean document to the API shape', () => {
  assert.deepEqual(toProfile({ ...goodProfile, __v: 0 }), { id: 'mai-tran', name: 'Mai Tran', age: 27, bio: 'Sample bio.' })
})

test('toSwipeRecord maps a lean document to the API shape with an ISO date', () => {
  const record = toSwipeRecord({ _id: 'abc', ...goodSwipe, extra: 'dropped' })
  assert.deepEqual(record, {
    id: 'abc',
    playerId: PLAYER,
    profileId: 'mai-tran',
    action: 'LIKE',
    createdAt: '2026-11-26T10:00:00.000Z',
  })
})

test('isDuplicateKeyError recognises MongoDB error code 11000 only', () => {
  assert.equal(isDuplicateKeyError({ code: 11000 }), true)
  assert.equal(isDuplicateKeyError(Object.assign(new Error('E11000 duplicate key'), { code: 11000 })), true)
  for (const err of [null, undefined, new Error('x'), { code: 121 }, { code: '11000' }, 'E11000']) {
    assert.equal(isDuplicateKeyError(err), false, String(err))
  }
})

test('the monotonic clock never repeats or goes backwards, so the newest swipe is unambiguous', () => {
  const readings = [1000, 1000, 1000, 999, 1005]
  const clock = createMonotonicClock(() => new Date(readings.shift()))
  const stamps = [clock(), clock(), clock(), clock(), clock()].map((d) => d.getTime())
  assert.deepEqual(stamps, [1000, 1001, 1002, 1003, 1005])
})
