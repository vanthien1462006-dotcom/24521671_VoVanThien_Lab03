import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateSwipeInput as validateOnClient } from '../../../src/lab4/swipe/validateSwipe.js'
import { validateSwipe } from './validateSwipe.js'

const PLAYER = '3f2c1a9e-8b4d-4e6f-9a1b-2c3d4e5f6a7b'
const good = { playerId: PLAYER, profileId: 'p-1', action: 'LIKE' }

test('a valid body passes and returns exactly the three fields', () => {
  const result = validateSwipe(good)
  assert.equal(result.ok, true)
  assert.deepEqual(result.value, good)
})

test('extra fields are dropped: a client cannot forge an id, a date or any other property', () => {
  const result = validateSwipe({ ...good, id: 'x', _id: 'y', createdAt: '2000-01-01', __v: 3, $set: { action: 'LIKE' } })
  assert.equal(result.ok, true)
  assert.deepEqual(Object.keys(result.value).toSorted(), ['action', 'playerId', 'profileId'])
})

test('a body parsed from JSON with an own __proto__ key does not change the result', () => {
  const body = JSON.parse(`{"playerId":"${PLAYER}","profileId":"p1","action":"NOPE","__proto__":{"action":"LIKE"}}`)
  const result = validateSwipe(body)
  assert.equal(result.ok, true)
  assert.equal(result.value.action, 'NOPE')
  assert.equal(Object.getPrototypeOf(result.value), Object.prototype)
})

test('error messages never repeat the bad value', () => {
  const result = validateSwipe({ ...good, action: '<img src=x onerror=alert(1)>' })
  assert.equal(result.ok, false)
  assert.ok(!result.error.includes('img'))
})

// Client and server validation parity (slide 3): the same cases give the same verdict and message.
const PARITY_CASES = [
  good,
  { ...good, action: 'NOPE' },
  { ...good, action: 'SUPERLIKE' },
  { ...good, extra: 1 },
  null,
  undefined,
  [],
  'LIKE',
  5,
  {},
  { ...good, playerId: undefined },
  { ...good, playerId: '' },
  { ...good, playerId: 'abc' },
  { ...good, playerId: `${PLAYER}x` },
  { ...good, playerId: PLAYER.toUpperCase() },
  { ...good, playerId: 42 },
  { ...good, profileId: undefined },
  { ...good, profileId: '' },
  { ...good, profileId: ' p1' },
  { ...good, profileId: 'p/1' },
  { ...good, profileId: 'a'.repeat(64) },
  { ...good, profileId: 'a'.repeat(65) },
  { ...good, profileId: 7 },
  { ...good, action: undefined },
  { ...good, action: 'like' },
  { ...good, action: 'UNDO' },
  { ...good, action: 'constructor' },
  { ...good, action: '__proto__' },
  { ...good, action: ['LIKE'] },
]

for (const [index, body] of PARITY_CASES.entries()) {
  test(`parity case ${index}: client and server agree`, () => {
    assert.deepEqual(validateSwipe(body), validateOnClient(body))
  })
}
