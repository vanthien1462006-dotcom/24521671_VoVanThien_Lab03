import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SwipeApiError, fetchProfiles, fetchSwipes, postSwipe, resetSwipes, undoLastSwipe } from './swipeApi.js'

const PLAYER = '3f2c1a9e-8b4d-4e6f-9a1b-2c3d4e5f6a7b'

function fakeFetch(respond) {
  const calls = []
  const impl = async (url, init) => {
    calls.push({ url, init })
    return respond(url, init)
  }
  impl.calls = calls
  return impl
}

const reply = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body })
const noBody = (status) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    throw new SyntaxError('Unexpected end of JSON input')
  },
})

test('fetchProfiles GETs /api/profiles and returns the list', async () => {
  const profiles = [{ id: 'p1', name: 'Mai', age: 27, bio: 'Sample' }]
  const fetchImpl = fakeFetch(() => reply(200, profiles))
  assert.deepEqual(await fetchProfiles({ fetchImpl }), profiles)
  assert.equal(fetchImpl.calls[0].url, '/api/profiles')
})

test('fetchProfiles passes the abort signal to fetch', async () => {
  const controller = new AbortController()
  const fetchImpl = fakeFetch(() => reply(200, []))
  await fetchProfiles({ fetchImpl, signal: controller.signal })
  assert.equal(fetchImpl.calls[0].init.signal, controller.signal)
})

test('fetchProfiles rejects a payload that is not a list', async () => {
  await assert.rejects(fetchProfiles({ fetchImpl: fakeFetch(() => reply(200, { profiles: [] })) }), /not a list/)
})

test('an HTTP error throws a SwipeApiError with the server message and status', async () => {
  const fetchImpl = fakeFetch(() => reply(404, { error: 'Unknown profile.' }))
  await assert.rejects(fetchProfiles({ fetchImpl }), (err) => {
    assert.ok(err instanceof SwipeApiError)
    assert.equal(err.message, 'Unknown profile.')
    assert.equal(err.status, 404)
    return true
  })
})

test('an HTTP error without a JSON body falls back to the status', async () => {
  await assert.rejects(fetchProfiles({ fetchImpl: fakeFetch(() => noBody(502)) }), (err) => {
    assert.equal(err.status, 502)
    assert.match(err.message, /502/)
    return true
  })
})

test('an AbortError is not swallowed or wrapped', async () => {
  const fetchImpl = fakeFetch(() => {
    throw new DOMException('aborted', 'AbortError')
  })
  await assert.rejects(fetchProfiles({ fetchImpl }), (err) => err.name === 'AbortError')
})

test('fetchSwipes GETs /api/swipe with the player id', async () => {
  const fetchImpl = fakeFetch(() => reply(200, []))
  assert.deepEqual(await fetchSwipes(PLAYER, { fetchImpl }), [])
  assert.equal(fetchImpl.calls[0].url, `/api/swipe?playerId=${PLAYER}`)
})

test('fetchSwipes rejects an invalid player id before any request', async () => {
  const fetchImpl = fakeFetch(() => reply(200, []))
  await assert.rejects(fetchSwipes('../admin', { fetchImpl }), TypeError)
  assert.equal(fetchImpl.calls.length, 0)
})

test('postSwipe POSTs only the three validated fields as JSON', async () => {
  const saved = { id: 's1', playerId: PLAYER, profileId: 'p1', action: 'LIKE', createdAt: '2026-11-26T10:00:00.000Z' }
  const fetchImpl = fakeFetch(() => reply(201, saved))
  const result = await postSwipe(
    { playerId: PLAYER, profileId: 'p1', action: 'LIKE', id: 'forged', createdAt: 'forged' },
    { fetchImpl },
  )
  assert.deepEqual(result, saved)
  const { url, init } = fetchImpl.calls[0]
  assert.equal(url, '/api/swipe')
  assert.equal(init.method, 'POST')
  assert.equal(init.headers['Content-Type'], 'application/json')
  assert.deepEqual(JSON.parse(init.body), { playerId: PLAYER, profileId: 'p1', action: 'LIKE' })
})

test('postSwipe rejects invalid input before any request', async () => {
  const fetchImpl = fakeFetch(() => reply(201, {}))
  await assert.rejects(postSwipe({ playerId: PLAYER, profileId: 'p1', action: 'MAYBE' }, { fetchImpl }), (err) => {
    assert.ok(err instanceof SwipeApiError)
    assert.equal(err.status, 400)
    assert.match(err.message, /action/)
    return true
  })
  assert.equal(fetchImpl.calls.length, 0)
})

test('postSwipe surfaces a 409 conflict with its status', async () => {
  const fetchImpl = fakeFetch(() => reply(409, { error: 'Already swiped.' }))
  await assert.rejects(postSwipe({ playerId: PLAYER, profileId: 'p1', action: 'NOPE' }, { fetchImpl }), (err) => {
    assert.equal(err.status, 409)
    return true
  })
})

test('undoLastSwipe sends DELETE /api/swipe/last and returns the removed record', async () => {
  const removed = { id: 's1', playerId: PLAYER, profileId: 'p1', action: 'LIKE', createdAt: '2026-11-26T10:00:00.000Z' }
  const fetchImpl = fakeFetch(() => reply(200, removed))
  assert.deepEqual(await undoLastSwipe(PLAYER, { fetchImpl }), removed)
  assert.equal(fetchImpl.calls[0].url, `/api/swipe/last?playerId=${PLAYER}`)
  assert.equal(fetchImpl.calls[0].init.method, 'DELETE')
})

test('undoLastSwipe on an empty history surfaces the 404', async () => {
  const fetchImpl = fakeFetch(() => reply(404, { error: 'Nothing to undo.' }))
  await assert.rejects(undoLastSwipe(PLAYER, { fetchImpl }), (err) => err.status === 404)
})

test('undoLastSwipe rejects an invalid player id before any request', async () => {
  const fetchImpl = fakeFetch(() => reply(200, {}))
  await assert.rejects(undoLastSwipe('nope', { fetchImpl }), TypeError)
  assert.equal(fetchImpl.calls.length, 0)
})

test('resetSwipes sends DELETE /api/swipe and accepts 204 with no body', async () => {
  const fetchImpl = fakeFetch(() => noBody(204))
  assert.equal(await resetSwipes(PLAYER, { fetchImpl }), undefined)
  assert.equal(fetchImpl.calls[0].url, `/api/swipe?playerId=${PLAYER}`)
  assert.equal(fetchImpl.calls[0].init.method, 'DELETE')
})

test('resetSwipes surfaces a server error', async () => {
  const fetchImpl = fakeFetch(() => reply(500, { error: 'Internal server error' }))
  await assert.rejects(resetSwipes(PLAYER, { fetchImpl }), (err) => err.status === 500)
})
