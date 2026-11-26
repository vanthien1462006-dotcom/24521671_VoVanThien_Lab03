import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import { Profile } from './Profile.js'
import { Swipe } from './Swipe.js'
import { createMongoSwipeRepository } from './mongoSwipeRepository.js'
import { SEED_PROFILES, seedProfiles } from './seedProfiles.js'

// Real MongoDB round trip. It runs only when MONGODB_URI_TEST is set (see .env.example for the
// shape of the value), for example in the shell before `npm --prefix server test`.
// The database name must end with "-test" because the test empties its collections.
const uri = process.env.MONGODB_URI_TEST
const skip = uri ? false : 'MONGODB_URI_TEST is not set (needs a real MongoDB)'

let repository
const newPlayer = () => crypto.randomUUID()

before(async () => {
  if (skip) return
  const dbName = new URL(uri).pathname.replace(/^\//, '')
  if (!dbName.endsWith('-test')) throw new Error(`Refusing to run on database "${dbName}": its name must end with -test`)
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  await Promise.all([Profile.deleteMany({}), Swipe.deleteMany({})])
  await Promise.all([Profile.init(), Swipe.init()])
  await seedProfiles(Profile)
  repository = createMongoSwipeRepository({ Profile, Swipe })
})

after(async () => {
  if (skip) return
  await mongoose.disconnect()
})

test('the seed is idempotent against the real database', { skip }, async () => {
  const again = await seedProfiles(Profile)
  assert.deepEqual(again, { upserted: 0, modified: 0 })
  assert.equal(await Profile.countDocuments(), SEED_PROFILES.length)
})

test('listProfiles returns the deck in order in the API shape', { skip }, async () => {
  const profiles = await repository.listProfiles()
  assert.deepEqual(profiles.map((p) => p.id), SEED_PROFILES.map((p) => p._id))
  assert.deepEqual(Object.keys(profiles[0]).toSorted(), ['age', 'bio', 'id', 'name'])
})

test('hasProfile knows the deck and nothing else', { skip }, async () => {
  assert.equal(await repository.hasProfile('mai-tran'), true)
  assert.equal(await repository.hasProfile('nobody'), false)
})

test('a swipe round trip: create, list, and the stored document has only the known fields', { skip }, async () => {
  const player = newPlayer()
  const saved = await repository.createSwipe({ playerId: player, profileId: 'mai-tran', action: 'SUPERLIKE' })
  assert.match(saved.id, /^[0-9a-f-]{36}$/)
  assert.equal(saved.action, 'SUPERLIKE')
  assert.deepEqual(await repository.listSwipes(player), [saved])
  const raw = await Swipe.collection.findOne({ _id: saved.id })
  assert.deepEqual(Object.keys(raw).toSorted(), ['_id', 'action', 'createdAt', 'playerId', 'profileId'])
})

test('the unique index turns a second swipe on the same profile into a conflict', { skip }, async () => {
  const player = newPlayer()
  await repository.createSwipe({ playerId: player, profileId: 'khoa-le', action: 'LIKE' })
  assert.deepEqual(await repository.createSwipe({ playerId: player, profileId: 'khoa-le', action: 'NOPE' }), { conflict: true })
  assert.equal((await repository.listSwipes(player)).length, 1)
})

test('two simultaneous requests for the same profile: exactly one wins', { skip }, async () => {
  const player = newPlayer()
  const results = await Promise.all(
    Array.from({ length: 8 }, () => repository.createSwipe({ playerId: player, profileId: 'linh-pham', action: 'LIKE' })),
  )
  assert.equal(results.filter((r) => !('conflict' in r)).length, 1)
  assert.equal(results.filter((r) => 'conflict' in r).length, 7)
  assert.equal((await repository.listSwipes(player)).length, 1)
})

test('undo removes the newest swipe even when swipes are made back to back', { skip }, async () => {
  const player = newPlayer()
  const ids = SEED_PROFILES.slice(0, 5).map((p) => p._id)
  for (const profileId of ids) await repository.createSwipe({ playerId: player, profileId, action: 'LIKE' })
  assert.deepEqual((await repository.listSwipes(player)).map((s) => s.profileId), ids)
  for (const expected of ids.toReversed()) assert.equal((await repository.deleteLastSwipe(player)).profileId, expected)
  assert.equal(await repository.deleteLastSwipe(player), null)
})

test('undo and reset only touch the given player', { skip }, async () => {
  const a = newPlayer()
  const b = newPlayer()
  await repository.createSwipe({ playerId: a, profileId: 'duc-vo', action: 'LIKE' })
  await repository.createSwipe({ playerId: b, profileId: 'duc-vo', action: 'LIKE' })
  await repository.createSwipe({ playerId: a, profileId: 'an-nguyen', action: 'NOPE' })
  assert.equal(await repository.deleteAllSwipes(a), 2)
  assert.deepEqual(await repository.listSwipes(a), [])
  assert.equal((await repository.listSwipes(b)).length, 1)
  assert.equal(await repository.deleteAllSwipes(a), 0)
})

test('a swipe removed by undo can be made again', { skip }, async () => {
  const player = newPlayer()
  await repository.createSwipe({ playerId: player, profileId: 'bao-ly', action: 'LIKE' })
  await repository.deleteLastSwipe(player)
  assert.equal((await repository.createSwipe({ playerId: player, profileId: 'bao-ly', action: 'NOPE' })).action, 'NOPE')
})

test('the database itself rejects a forged document that skips the schema', { skip }, async () => {
  await assert.rejects(Swipe.create({ playerId: 'not-a-uuid', profileId: 'mai-tran', action: 'LIKE', createdAt: new Date() }), /playerId/)
})
