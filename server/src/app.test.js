import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from './app.js'
import { createMessageStore } from './messageStore.js'

const CLIENT_ORIGIN = 'http://localhost:5173'
let server
let baseUrl

before(async () => {
  const store = createMessageStore({
    nasa: [{ id: 'seed-1', author: 'Mission Control', text: 'Welcome to #nasa', timestamp: '2026-11-13T00:00:00.000Z' }],
    notNasa: [],
  })
  const app = createApp({ store, clientOrigin: CLIENT_ORIGIN })
  await new Promise((resolve) => {
    server = app.listen(0, resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => new Promise((resolve) => server.close(resolve)))

function postJson(path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

test('GET lists the messages of a known channel', async () => {
  const res = await fetch(`${baseUrl}/api/channels/nasa/messages`)
  assert.equal(res.status, 200)
  const messages = await res.json()
  assert.equal(messages.length, 1)
  assert.equal(messages[0].text, 'Welcome to #nasa')
})

test('GET returns 404 for an unknown channel', async () => {
  const res = await fetch(`${baseUrl}/api/channels/mars/messages`)
  assert.equal(res.status, 404)
  assert.match((await res.json()).error, /channel/i)
})

test('POST stores a valid message with a server id and timestamp, then GET returns it', async () => {
  const res = await postJson('/api/channels/notNasa/messages', { author: 'Ada', text: 'First!' })
  assert.equal(res.status, 201)
  const created = await res.json()
  assert.match(created.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  assert.ok(!Number.isNaN(Date.parse(created.timestamp)))
  const list = await (await fetch(`${baseUrl}/api/channels/notNasa/messages`)).json()
  assert.deepEqual(list.at(-1), created)
})

test('POST ignores client-sent id and extra fields', async () => {
  const res = await postJson('/api/channels/nasa/messages', { author: 'Eve', text: 'Hi', id: 'forged', isAdmin: true })
  const created = await res.json()
  assert.notEqual(created.id, 'forged')
  assert.deepEqual(Object.keys(created).toSorted(), ['author', 'id', 'text', 'timestamp'])
})

test('POST returns 400 for a missing field', async () => {
  const res = await postJson('/api/channels/nasa/messages', { author: 'Ada' })
  assert.equal(res.status, 400)
  assert.match((await res.json()).error, /text/i)
})

test('POST returns 400 JSON for a malformed body', async () => {
  const res = await postJson('/api/channels/nasa/messages', '{"author": ')
  assert.equal(res.status, 400)
  assert.ok((await res.json()).error)
})

test('POST returns 404 for an unknown channel', async () => {
  const res = await postJson('/api/channels/mars/messages', { author: 'Ada', text: 'Hi' })
  assert.equal(res.status, 404)
})

test('CORS allows the client origin only', async () => {
  const allowed = await fetch(`${baseUrl}/api/channels/nasa/messages`, { headers: { Origin: CLIENT_ORIGIN } })
  assert.equal(allowed.headers.get('access-control-allow-origin'), CLIENT_ORIGIN)
  const other = await fetch(`${baseUrl}/api/channels/nasa/messages`, { headers: { Origin: 'https://evil.example' } })
  assert.notEqual(other.headers.get('access-control-allow-origin'), 'https://evil.example')
})
