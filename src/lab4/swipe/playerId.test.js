import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PLAYER_ID_KEY, ensurePlayerId, isPlayerId, readPlayerId } from './playerId.js'

const ID_A = '3f2c1a9e-8b4d-4e6f-9a1b-2c3d4e5f6a7b'
const ID_B = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'

function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
}

const throwingStorage = {
  getItem() {
    throw new Error('blocked')
  },
  setItem() {
    throw new Error('blocked')
  },
}

test('the storage key is namespaced', () => {
  assert.equal(PLAYER_ID_KEY, 'lab4.swipe.playerId')
})

test('isPlayerId accepts a UUID and nothing else', () => {
  assert.equal(isPlayerId(ID_A), true)
  assert.equal(isPlayerId(ID_A.toUpperCase()), true)
  for (const v of ['', 'abc', null, undefined, 5, {}, `${ID_A} `, ID_A.slice(1)]) assert.equal(isPlayerId(v), false, String(v))
})

test('readPlayerId returns a valid stored id', () => {
  assert.equal(readPlayerId(fakeStorage({ [PLAYER_ID_KEY]: ID_A })), ID_A)
})

test('readPlayerId returns null for a missing or invalid stored value', () => {
  assert.equal(readPlayerId(fakeStorage()), null)
  assert.equal(readPlayerId(fakeStorage({ [PLAYER_ID_KEY]: 'not-a-uuid' })), null)
  assert.equal(readPlayerId(fakeStorage({ [PLAYER_ID_KEY]: '<script>' })), null)
})

test('readPlayerId returns null when storage is missing or throws', () => {
  assert.equal(readPlayerId(null), null)
  assert.equal(readPlayerId(undefined), null)
  assert.equal(readPlayerId(throwingStorage), null)
})

test('ensurePlayerId keeps an existing valid id', () => {
  const storage = fakeStorage({ [PLAYER_ID_KEY]: ID_A })
  assert.equal(ensurePlayerId(storage, () => ID_B), ID_A)
  assert.equal(storage.data.get(PLAYER_ID_KEY), ID_A)
})

test('ensurePlayerId creates and stores an id when there is none', () => {
  const storage = fakeStorage()
  assert.equal(ensurePlayerId(storage, () => ID_B), ID_B)
  assert.equal(storage.data.get(PLAYER_ID_KEY), ID_B)
})

test('ensurePlayerId replaces an invalid stored value', () => {
  const storage = fakeStorage({ [PLAYER_ID_KEY]: 'garbage' })
  assert.equal(ensurePlayerId(storage, () => ID_B), ID_B)
  assert.equal(storage.data.get(PLAYER_ID_KEY), ID_B)
})

test('ensurePlayerId is idempotent: a second call returns the same id', () => {
  const storage = fakeStorage()
  const makeId = (() => {
    const ids = [ID_A, ID_B]
    return () => ids.shift()
  })()
  assert.equal(ensurePlayerId(storage, makeId), ID_A)
  assert.equal(ensurePlayerId(storage, makeId), ID_A)
})

test('ensurePlayerId still returns an id when storage is missing or throws', () => {
  assert.equal(ensurePlayerId(null, () => ID_B), ID_B)
  assert.equal(ensurePlayerId(throwingStorage, () => ID_B), ID_B)
})

test('ensurePlayerId uses crypto.randomUUID by default and the result is valid', () => {
  assert.equal(isPlayerId(ensurePlayerId(fakeStorage())), true)
})
