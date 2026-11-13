import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FORUM_CHANNELS, fetchChannelMessages, isKnownChannel, postChannelMessage } from './forumApi.js'

function fakeFetch(status, body) {
  const calls = []
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init })
    return { ok: status >= 200 && status < 300, status, json: async () => body }
  }
  return { calls, fetchImpl }
}

test('FORUM_CHANNELS lists the three slide channels, frozen', () => {
  assert.deepEqual(
    FORUM_CHANNELS.map((c) => c.id),
    ['nasa', 'esports-tribunal', 'notNasa'],
  )
  assert.ok(Object.isFrozen(FORUM_CHANNELS))
  assert.ok(FORUM_CHANNELS.every((c) => Object.isFrozen(c)))
})

test('isKnownChannel accepts only listed ids', () => {
  assert.equal(isKnownChannel('nasa'), true)
  assert.equal(isKnownChannel('NASA'), false)
  assert.equal(isKnownChannel(undefined), false)
})

test('fetchChannelMessages GETs the channel path and passes the abort signal', async () => {
  const { calls, fetchImpl } = fakeFetch(200, [{ id: 'm1' }])
  const controller = new AbortController()
  const messages = await fetchChannelMessages('esports-tribunal', { signal: controller.signal, fetchImpl })
  assert.deepEqual(messages, [{ id: 'm1' }])
  assert.equal(calls[0].url, '/api/channels/esports-tribunal/messages')
  assert.equal(calls[0].init.signal, controller.signal)
})

test('fetchChannelMessages rejects an unknown channel without a request', async () => {
  const { calls, fetchImpl } = fakeFetch(200, [])
  await assert.rejects(fetchChannelMessages('mars', { fetchImpl }), /Unknown channel/)
  assert.equal(calls.length, 0)
})

test('fetchChannelMessages throws on a non-2xx status', async () => {
  const { fetchImpl } = fakeFetch(500, { error: 'boom' })
  await assert.rejects(fetchChannelMessages('nasa', { fetchImpl }), /500/)
})

test('fetchChannelMessages throws when the payload is not a list', async () => {
  const { fetchImpl } = fakeFetch(200, { messages: [] })
  await assert.rejects(fetchChannelMessages('nasa', { fetchImpl }), /list/)
})

test('fetchChannelMessages lets AbortError through untouched', async () => {
  const fetchImpl = async () => {
    throw new DOMException('aborted', 'AbortError')
  }
  await assert.rejects(fetchChannelMessages('nasa', { fetchImpl }), { name: 'AbortError' })
})

test('postChannelMessage POSTs JSON with only author and text', async () => {
  const { calls, fetchImpl } = fakeFetch(201, { id: 'new', author: 'Ada', text: 'Hi' })
  const created = await postChannelMessage('nasa', { author: 'Ada', text: 'Hi', isAdmin: true }, { fetchImpl })
  assert.equal(created.id, 'new')
  assert.equal(calls[0].url, '/api/channels/nasa/messages')
  assert.equal(calls[0].init.method, 'POST')
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json')
  assert.deepEqual(JSON.parse(calls[0].init.body), { author: 'Ada', text: 'Hi' })
})

test('postChannelMessage surfaces the server error message on 400', async () => {
  const { fetchImpl } = fakeFetch(400, { error: 'Missing required field: text.' })
  await assert.rejects(postChannelMessage('nasa', { author: 'Ada', text: '' }, { fetchImpl }), /Missing required field: text/)
})
