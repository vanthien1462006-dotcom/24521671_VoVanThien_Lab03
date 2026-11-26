import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateSwipeInput } from './validateSwipe.js'

const PLAYER = '3f2c1a9e-8b4d-4e6f-9a1b-2c3d4e5f6a7b'
const good = { playerId: PLAYER, profileId: 'p-1', action: 'LIKE' }

test('a valid input passes and returns exactly the three fields', () => {
  const result = validateSwipeInput(good)
  assert.equal(result.ok, true)
  assert.deepEqual(result.value, good)
})

test('every action is accepted', () => {
  for (const action of ['LIKE', 'NOPE', 'SUPERLIKE']) {
    assert.equal(validateSwipeInput({ ...good, action }).ok, true, action)
  }
})

test('extra fields are dropped, so a client cannot forge an id or a date', () => {
  const result = validateSwipeInput({ ...good, id: 'x', _id: 'y', createdAt: '2000-01-01', isAdmin: true })
  assert.equal(result.ok, true)
  assert.deepEqual(Object.keys(result.value).toSorted(), ['action', 'playerId', 'profileId'])
})

test('a body that is not an object is rejected', () => {
  for (const body of [null, undefined, [], 'LIKE', 5, true]) {
    const result = validateSwipeInput(body)
    assert.equal(result.ok, false, String(body))
    assert.match(result.error, /JSON object/)
  }
})

test('playerId must be a UUID', () => {
  for (const playerId of [undefined, null, '', 'abc', 42, `${PLAYER}x`, PLAYER.replaceAll('-', ''), {}]) {
    const result = validateSwipeInput({ ...good, playerId })
    assert.equal(result.ok, false, String(playerId))
    assert.match(result.error, /playerId/)
  }
})

test('profileId is 1 to 64 letters, digits, hyphen or underscore', () => {
  for (const profileId of ['p1', 'P_2-x', 'a'.repeat(64)]) {
    assert.equal(validateSwipeInput({ ...good, profileId }).ok, true, profileId)
  }
  for (const profileId of [undefined, null, '', ' ', ' p1', 'p 1', 'p/1', 'p.1', '<b>', 'a'.repeat(65), 7]) {
    const result = validateSwipeInput({ ...good, profileId })
    assert.equal(result.ok, false, String(profileId))
    assert.match(result.error, /profileId/)
  }
})

test('action must be one of the three, in capitals', () => {
  for (const action of [undefined, null, '', 'like', 'UNDO', 'MAYBE', 'constructor', '__proto__', 1, ['LIKE']]) {
    const result = validateSwipeInput({ ...good, action })
    assert.equal(result.ok, false, String(action))
    assert.match(result.error, /action/)
  }
})

test('an error message never repeats the bad value', () => {
  const result = validateSwipeInput({ ...good, profileId: '<script>alert(1)</script>' })
  assert.equal(result.ok, false)
  assert.ok(!result.error.includes('script'))
})

test('the input object is not modified', () => {
  const input = Object.freeze({ ...good, extra: 1 })
  validateSwipeInput(input)
  assert.equal(input.extra, 1)
})
