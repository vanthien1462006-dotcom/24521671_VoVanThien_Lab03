import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../app.js'
import { createMessageStore } from '../messageStore.js'
import { createAppealStore } from './appealStore.js'

const CLIENT_ORIGIN = 'http://localhost:5173'
const HOUR = 3_600_000
const START = Date.UTC(2026, 10, 26, 10, 0, 0)
const DOSSIERS = Object.freeze([
  Object.freeze({
    playerId: 'himass',
    handle: 'Himass',
    team: 'Sample Squad',
    caseId: 'FP-2026-001',
    summary: 'Sample case one.',
    slaHours: 72,
    modes: Object.freeze([Object.freeze({ id: 'solo', label: 'Solo', matches: 30, flags: 3 })]),
  }),
  Object.freeze({
    playerId: 'tanvuu',
    handle: 'TanVuu',
    team: 'Sample Squad',
    caseId: 'FP-2026-002',
    summary: 'Sample case two.',
    slaHours: 48,
    modes: Object.freeze([Object.freeze({ id: 'duo', label: 'Duo', matches: 20, flags: 4 })]),
  }),
])
const body = Object.freeze({
  contactEmail: 'player@example.com',
  category: 'missing-context',
  statement: 'This statement is long enough to be accepted by the validator of the tests.',
  confirmed: true,
})

const clock = { ms: START }
let server
let baseUrl

const listen = (app) =>
  new Promise((resolve) => {
    const s = app.listen(0, () => resolve(s))
  })
const closeServer = (s) => new Promise((resolve) => s.close(resolve))

before(async () => {
  const appealStore = createAppealStore({ dossiers: DOSSIERS, now: () => new Date(clock.ms) })
  server = await listen(createApp({ store: createMessageStore({ nasa: [] }), clientOrigin: CLIENT_ORIGIN, appealStore }))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => closeServer(server))

const url = (path) => `${baseUrl}${path}`
const post = (playerId, payload, raw = false) =>
  fetch(url(`/api/dossiers/${playerId}/appeal`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw ? payload : JSON.stringify(payload),
  })

test('GET /api/time returns the server clock and must not be cached', async () => {
  clock.ms = START + 5000
  const res = await fetch(url('/api/time'))
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { now: new Date(START + 5000).toISOString() })
  assert.match(res.headers.get('cache-control'), /no-store/)
})

test('GET /api/dossiers lists the cases', async () => {
  const res = await fetch(url('/api/dossiers'))
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), [
    { playerId: 'himass', handle: 'Himass', caseId: 'FP-2026-001' },
    { playerId: 'tanvuu', handle: 'TanVuu', caseId: 'FP-2026-002' },
  ])
})

test('GET /api/dossiers/:playerId returns the dossier with deadlineAt and serverNow from the server clock', async () => {
  clock.ms = START + 60_000
  const res = await fetch(url('/api/dossiers/tanvuu'))
  assert.equal(res.status, 200)
  assert.match(res.headers.get('cache-control'), /no-store/)
  const dossier = await res.json()
  assert.equal(dossier.handle, 'TanVuu')
  assert.equal(dossier.serverNow, new Date(START + 60_000).toISOString())
  assert.equal(dossier.deadlineAt, new Date(START + 48 * HOUR).toISOString())
  assert.equal(dossier.appeal, null)
  assert.deepEqual(dossier.modes, [{ id: 'duo', label: 'Duo', matches: 20, flags: 4 }])
})

test('an unknown or malformed id is a 404 with a fixed message', async () => {
  for (const id of ['nobody', 'Himass', 'a%20b', '..%2Fadmin', 'a'.repeat(33), 'constructor', '__proto__']) {
    const res = await fetch(url(`/api/dossiers/${id}`))
    assert.equal(res.status, 404, id)
    assert.deepEqual(await res.json(), { error: 'Unknown dossier.' }, id)
  }
})

test('POST saves an appeal and returns 201 with a receipt that has a server id and date', async () => {
  clock.ms = START + HOUR
  const res = await post('himass', body)
  assert.equal(res.status, 201)
  const receipt = await res.json()
  assert.deepEqual(Object.keys(receipt).toSorted(), ['caseId', 'id', 'playerId', 'submittedAt'])
  assert.equal(receipt.playerId, 'himass')
  assert.equal(receipt.caseId, 'FP-2026-001')
  assert.equal(receipt.submittedAt, new Date(START + HOUR).toISOString())
  assert.match(receipt.id, /^[0-9a-f-]{36}$/)
  const dossier = await (await fetch(url('/api/dossiers/himass'))).json()
  assert.deepEqual(dossier.appeal, receipt)
})

test('the statement and the email are never sent back', async () => {
  const dossier = await (await fetch(url('/api/dossiers/himass'))).text()
  assert.ok(!dossier.includes(body.statement))
  assert.ok(!dossier.includes(body.contactEmail))
})

test('POST for a case that already has an appeal returns 409', async () => {
  const res = await post('himass', body)
  assert.equal(res.status, 409)
  assert.deepEqual(await res.json(), { error: 'An appeal was already submitted for this case.' })
})

test('POST drops forged fields: the id, the date and the player come from the server and the URL', async () => {
  clock.ms = START + 2 * HOUR
  const res = await post('tanvuu', { ...body, id: 'forged', submittedAt: '1999-01-01T00:00:00.000Z', playerId: 'himass', isAdmin: true })
  assert.equal(res.status, 201)
  const receipt = await res.json()
  assert.notEqual(receipt.id, 'forged')
  assert.equal(receipt.playerId, 'tanvuu')
  assert.equal(receipt.submittedAt, new Date(START + 2 * HOUR).toISOString())
  assert.ok(!('isAdmin' in receipt))
})

test('POST with an invalid body returns 400 with a fixed message and stores nothing', async () => {
  const fresh = createApp({
    store: createMessageStore({}),
    clientOrigin: CLIENT_ORIGIN,
    appealStore: createAppealStore({ dossiers: DOSSIERS, now: () => new Date(START) }),
  })
  const s = await listen(fresh)
  try {
    const origin = `http://127.0.0.1:${s.address().port}`
    const send = (payload, raw = false) =>
      fetch(`${origin}/api/dossiers/himass/appeal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: raw ? payload : JSON.stringify(payload) })
    const bad = [
      { ...body, contactEmail: 'nope' },
      { ...body, category: 'other' },
      { ...body, statement: 'too short' },
      { ...body, confirmed: false },
      {},
      [],
      'text',
    ]
    for (const payload of bad) {
      const res = await send(payload)
      assert.equal(res.status, 400, JSON.stringify(payload))
      assert.equal(typeof (await res.json()).error, 'string')
    }
    assert.equal((await send('{"contactEmail":', true)).status, 400)
    assert.equal((await (await fetch(`${origin}/api/dossiers/himass`)).json()).appeal, null)
  } finally {
    await closeServer(s)
  }
})

test('POST with an error message never repeats the statement', async () => {
  const res = await post('himass', { ...body, statement: '<script>alert(1)</script>', contactEmail: 'bad' })
  assert.equal(res.status, 400)
  assert.ok(!(await res.text()).includes('script'))
})

test('POST for an unknown case returns 404, even with a valid body', async () => {
  for (const id of ['nobody', 'Himass', 'constructor']) {
    const res = await post(id, body)
    assert.equal(res.status, 404, id)
    assert.deepEqual(await res.json(), { error: 'Unknown dossier.' })
  }
})

test('POST after the window closed returns 409, judged with the server clock', async () => {
  const closed = createApp({
    store: createMessageStore({}),
    clientOrigin: CLIENT_ORIGIN,
    appealStore: createAppealStore({ dossiers: DOSSIERS, now: () => new Date(clock.ms) }),
  })
  clock.ms = START
  const s = await listen(closed)
  try {
    const origin = `http://127.0.0.1:${s.address().port}`
    clock.ms = START + 48 * HOUR - 1
    const send = () =>
      fetch(`${origin}/api/dossiers/tanvuu/appeal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    clock.ms = START + 48 * HOUR
    const res = await send()
    assert.equal(res.status, 409)
    assert.deepEqual(await res.json(), { error: 'The appeal window has closed.' })
    assert.equal((await (await fetch(`${origin}/api/dossiers/tanvuu`)).json()).appeal, null)
  } finally {
    await closeServer(s)
  }
})

test('a body larger than the limit is refused with 413', async () => {
  const res = await post('himass', { ...body, statement: 'x'.repeat(20_000) })
  assert.equal(res.status, 413)
})

test('a store failure returns 500 with a fixed message that leaks nothing', async () => {
  const failing = {
    listDossiers() {
      throw new Error('ECONNREFUSED internal-host:27017 password=secret')
    },
  }
  const s = await listen(createApp({ store: createMessageStore({}), clientOrigin: CLIENT_ORIGIN, appealStore: failing }))
  try {
    const res = await fetch(`http://127.0.0.1:${s.address().port}/api/dossiers`)
    assert.equal(res.status, 500)
    const text = await res.text()
    assert.deepEqual(JSON.parse(text), { error: 'Internal server error' })
    assert.ok(!text.includes('secret') && !text.includes('internal-host'))
  } finally {
    await closeServer(s)
  }
})

test('without an appeal store the appeal routes do not exist and the forum still works', async () => {
  const s = await listen(createApp({ store: createMessageStore({ nasa: [] }), clientOrigin: CLIENT_ORIGIN }))
  try {
    const origin = `http://127.0.0.1:${s.address().port}`
    assert.equal((await fetch(`${origin}/api/dossiers`)).status, 404)
    assert.equal((await fetch(`${origin}/api/time`)).status, 404)
    assert.equal((await fetch(`${origin}/api/channels/nasa/messages`)).status, 200)
  } finally {
    await closeServer(s)
  }
})
