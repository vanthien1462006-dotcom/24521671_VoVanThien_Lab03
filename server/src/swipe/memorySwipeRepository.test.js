import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createMemorySwipeRepository } from './memorySwipeRepository.js'

const PLAYER_A = '3f2c1a9e-8b4d-4e6f-9a1b-2c3d4e5f6a7b'
const PLAYER_B = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d'
const PROFILES = [
  { id: 'p1', name: 'Mai', age: 27, bio: 'Sample one.' },
  { id: 'p2', name: 'Khoa', age: 30, bio: 'Sample two.' },
  { id: 'p3', name: 'Linh', age: 24, bio: 'Sample three.' },
]

function makeRepository() {
  let n = 0
  return createMemorySwipeRepository({
    profiles: PROFILES,
    now: () => new Date('2026-11-26T10:00:00.000Z'),
    makeId: () => `swipe-${(n += 1)}`,
  })
}

test('listProfiles returns the deck in order, as copies', async () => {
  const repo = makeRepository()
  const profiles = await repo.listProfiles()
  assert.deepEqual(profiles.map((p) => p.id), ['p1', 'p2', 'p3'])
  profiles[0].name = 'Changed'
  assert.equal((await repo.listProfiles())[0].name, 'Mai')
})

test('hasProfile knows the deck and nothing else', async () => {
  const repo = makeRepository()
  assert.equal(await repo.hasProfile('p2'), true)
  assert.equal(await repo.hasProfile('p9'), false)
  assert.equal(await repo.hasProfile('constructor'), false)
})

test('createSwipe stores a record with a server id and date', async () => {
  const repo = makeRepository()
  const saved = await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p1', action: 'LIKE' })
  assert.deepEqual(saved, {
    id: 'swipe-1',
    playerId: PLAYER_A,
    profileId: 'p1',
    action: 'LIKE',
    createdAt: '2026-11-26T10:00:00.000Z',
  })
})

test('listSwipes is oldest first and only for that player', async () => {
  const repo = makeRepository()
  await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p1', action: 'LIKE' })
  await repo.createSwipe({ playerId: PLAYER_B, profileId: 'p1', action: 'NOPE' })
  await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p2', action: 'NOPE' })
  assert.deepEqual((await repo.listSwipes(PLAYER_A)).map((s) => s.profileId), ['p1', 'p2'])
  assert.deepEqual((await repo.listSwipes(PLAYER_B)).map((s) => s.profileId), ['p1'])
  assert.deepEqual(await repo.listSwipes('nobody'), [])
})

test('the same player cannot swipe the same profile twice', async () => {
  const repo = makeRepository()
  await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p1', action: 'LIKE' })
  assert.deepEqual(await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p1', action: 'NOPE' }), { conflict: true })
  assert.equal((await repo.listSwipes(PLAYER_A)).length, 1)
})

test('another player can swipe the same profile', async () => {
  const repo = makeRepository()
  await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p1', action: 'LIKE' })
  const saved = await repo.createSwipe({ playerId: PLAYER_B, profileId: 'p1', action: 'LIKE' })
  assert.equal(saved.playerId, PLAYER_B)
})

test('deleteLastSwipe removes the newest swipe of that player (last in, first out)', async () => {
  const repo = makeRepository()
  await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p1', action: 'LIKE' })
  await repo.createSwipe({ playerId: PLAYER_B, profileId: 'p2', action: 'LIKE' })
  await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p2', action: 'NOPE' })
  assert.equal((await repo.deleteLastSwipe(PLAYER_A)).profileId, 'p2')
  assert.equal((await repo.deleteLastSwipe(PLAYER_A)).profileId, 'p1')
  assert.equal(await repo.deleteLastSwipe(PLAYER_A), null)
  assert.equal((await repo.listSwipes(PLAYER_B)).length, 1)
})

test('a swipe removed by undo can be made again', async () => {
  const repo = makeRepository()
  await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p1', action: 'LIKE' })
  await repo.deleteLastSwipe(PLAYER_A)
  const again = await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p1', action: 'NOPE' })
  assert.equal(again.action, 'NOPE')
})

test('deleteAllSwipes clears one player and reports how many', async () => {
  const repo = makeRepository()
  await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p1', action: 'LIKE' })
  await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p2', action: 'LIKE' })
  await repo.createSwipe({ playerId: PLAYER_B, profileId: 'p1', action: 'LIKE' })
  assert.equal(await repo.deleteAllSwipes(PLAYER_A), 2)
  assert.deepEqual(await repo.listSwipes(PLAYER_A), [])
  assert.equal((await repo.listSwipes(PLAYER_B)).length, 1)
  assert.equal(await repo.deleteAllSwipes(PLAYER_A), 0)
})

test('returned records are copies: changing them does not change the store', async () => {
  const repo = makeRepository()
  const saved = await repo.createSwipe({ playerId: PLAYER_A, profileId: 'p1', action: 'LIKE' })
  saved.action = 'NOPE'
  const listed = await repo.listSwipes(PLAYER_A)
  listed[0].action = 'NOPE'
  assert.equal((await repo.listSwipes(PLAYER_A))[0].action, 'LIKE')
})
