import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { createApp } from '../app.js'
import { createMessageStore } from '../messageStore.js'
import { createMemorySwipeRepository } from './memorySwipeRepository.js'

const CLIENT_ORIGIN = 'http://localhost:5173'
const PROFILES = [
  { id: 'p1', name: 'Mai', age: 27, bio: 'Sample one.' },
  { id: 'p2', name: 'Khoa', age: 30, bio: 'Sample two.' },
  { id: 'p3', name: 'Linh', age: 24, bio: 'Sample three.' },
]
const FIXED_NOW = '2026-11-26T10:00:00.000Z'

let server
let baseUrl

function listen(app) {
  return new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
}

before(async () => {
  const swipeRepository = createMemorySwipeRepository({ profiles: PROFILES, now: () => new Date(FIXED_NOW) })
  server = await listen(createApp({ store: createMessageStore({ nasa: [] }), clientOrigin: CLIENT_ORIGIN, swipeRepository }))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => new Promise((resolve) => server.close(resolve)))

const newPlayer = () => crypto.randomUUID()
const url = (path) => `${baseUrl}${path}`
const post = (playerId, profileId, action, extra = {}) =>
  fetch(url('/api/swipe'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, profileId, action, ...extra }),
  })
const list = async (playerId) => (await fetch(url(`/api/swipe?playerId=${playerId}`))).json()

test('GET /api/profiles returns the deck in order', async () => {
  const res = await fetch(url('/api/profiles'))
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), PROFILES)
})

test('GET /api/swipe is empty for a new player', async () => {
  assert.deepEqual(await list(newPlayer()), [])
})

test('GET /api/swipe needs a valid playerId', async () => {
  for (const query of ['', '?playerId=', '?playerId=abc', '?playerId=../../etc']) {
    const res = await fetch(url(`/api/swipe${query}`))
    assert.equal(res.status, 400, query)
    assert.match((await res.json()).error, /playerId/)
  }
})

test('POST /api/swipe saves a swipe and returns 201 with the record', async () => {
  const player = newPlayer()
  const res = await post(player, 'p1', 'LIKE')
  assert.equal(res.status, 201)
  const saved = await res.json()
  assert.equal(saved.playerId, player)
  assert.equal(saved.profileId, 'p1')
  assert.equal(saved.action, 'LIKE')
  assert.match(saved.id, /^[0-9a-f-]{36}$/)
  assert.deepEqual(await list(player), [saved])
})

test('POST drops forged fields: the id and the date come from the server', async () => {
  const player = newPlayer()
  const res = await post(player, 'p1', 'NOPE', { id: 'forged', _id: 'forged', createdAt: '1999-01-01T00:00:00.000Z', admin: true })
  assert.equal(res.status, 201)
  const saved = await res.json()
  assert.notEqual(saved.id, 'forged')
  assert.equal(saved.createdAt, FIXED_NOW)
  assert.ok(!('admin' in saved) && !('_id' in saved))
})

test('POST with an invalid body returns 400 and stores nothing', async () => {
  const player = newPlayer()
  const bad = [
    [player, 'p1', 'MAYBE'],
    [player, 'p1', 'UNDO'],
    [player, '', 'LIKE'],
    [player, 'p/1', 'LIKE'],
    ['not-a-uuid', 'p1', 'LIKE'],
  ]
  for (const [p, profileId, action] of bad) {
    const res = await post(p, profileId, action)
    assert.equal(res.status, 400, `${p} ${profileId} ${action}`)
    assert.equal(typeof (await res.json()).error, 'string')
  }
  assert.deepEqual(await list(player), [])
})

test('POST with a body that is not an object, or is malformed JSON, returns 400', async () => {
  const send = (body) =>
    fetch(url('/api/swipe'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
  assert.equal((await send('[1,2]')).status, 400)
  assert.equal((await send('{"playerId":')).status, 400)
})

test('POST for an unknown profile returns 404', async () => {
  const res = await post(newPlayer(), 'p9', 'LIKE')
  assert.equal(res.status, 404)
  assert.match((await res.json()).error, /profile/i)
})

test('POST for a profile the player already swiped returns 409, and another player may swipe it', async () => {
  const player = newPlayer()
  assert.equal((await post(player, 'p2', 'LIKE')).status, 201)
  const again = await post(player, 'p2', 'NOPE')
  assert.equal(again.status, 409)
  assert.equal(typeof (await again.json()).error, 'string')
  assert.equal((await list(player)).length, 1)
  assert.equal((await post(newPlayer(), 'p2', 'NOPE')).status, 201)
})

test('swipes are listed oldest first and are private to the player', async () => {
  const a = newPlayer()
  const b = newPlayer()
  await post(a, 'p1', 'LIKE')
  await post(b, 'p1', 'NOPE')
  await post(a, 'p2', 'SUPERLIKE')
  assert.deepEqual((await list(a)).map((s) => s.profileId), ['p1', 'p2'])
  assert.deepEqual((await list(b)).map((s) => s.profileId), ['p1'])
})

test('DELETE /api/swipe/last removes the newest swipe, last in first out, then returns 404', async () => {
  const player = newPlayer()
  await post(player, 'p1', 'LIKE')
  await post(player, 'p2', 'NOPE')
  const first = await fetch(url(`/api/swipe/last?playerId=${player}`), { method: 'DELETE' })
  assert.equal(first.status, 200)
  assert.equal((await first.json()).profileId, 'p2')
  const second = await fetch(url(`/api/swipe/last?playerId=${player}`), { method: 'DELETE' })
  assert.equal((await second.json()).profileId, 'p1')
  const empty = await fetch(url(`/api/swipe/last?playerId=${player}`), { method: 'DELETE' })
  assert.equal(empty.status, 404)
  assert.match((await empty.json()).error, /undo/i)
})

test('DELETE /api/swipe/last needs a valid playerId', async () => {
  const res = await fetch(url('/api/swipe/last?playerId=nope'), { method: 'DELETE' })
  assert.equal(res.status, 400)
})

test('DELETE /api/swipe clears only that player and returns 204', async () => {
  const a = newPlayer()
  const b = newPlayer()
  await post(a, 'p1', 'LIKE')
  await post(a, 'p2', 'LIKE')
  await post(b, 'p1', 'LIKE')
  const res = await fetch(url(`/api/swipe?playerId=${a}`), { method: 'DELETE' })
  assert.equal(res.status, 204)
  assert.deepEqual(await list(a), [])
  assert.equal((await list(b)).length, 1)
})

test('a swipe can be made again after an undo', async () => {
  const player = newPlayer()
  await post(player, 'p1', 'LIKE')
  await fetch(url(`/api/swipe/last?playerId=${player}`), { method: 'DELETE' })
  assert.equal((await post(player, 'p1', 'NOPE')).status, 201)
})

test('a repository failure returns 500 with a fixed message that leaks nothing', async () => {
  const failing = {
    listProfiles: async () => {
      throw new Error('connect ECONNREFUSED mongodb.internal:27017 password=secret')
    },
  }
  const s = await listen(createApp({ store: createMessageStore({}), clientOrigin: CLIENT_ORIGIN, swipeRepository: failing }))
  try {
    const res = await fetch(`http://127.0.0.1:${s.address().port}/api/profiles`)
    assert.equal(res.status, 500)
    const text = await res.text()
    assert.deepEqual(JSON.parse(text), { error: 'Internal server error' })
    assert.ok(!text.includes('secret') && !text.includes('mongodb'))
  } finally {
    await new Promise((resolve) => s.close(resolve))
  }
})

test('without a swipe repository the swipe routes do not exist and the forum still works', async () => {
  const s = await listen(createApp({ store: createMessageStore({ nasa: [] }), clientOrigin: CLIENT_ORIGIN }))
  try {
    const origin = `http://127.0.0.1:${s.address().port}`
    assert.equal((await fetch(`${origin}/api/profiles`)).status, 404)
    assert.equal((await fetch(`${origin}/api/channels/nasa/messages`)).status, 200)
  } finally {
    await new Promise((resolve) => s.close(resolve))
  }
})
