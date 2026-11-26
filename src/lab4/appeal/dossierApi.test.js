import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DossierApiError, fetchDossier, fetchDossiers, fetchServerTime, isDossierId, postAppeal } from './dossierApi.js'

const statement = 'x'.repeat(60)
const values = { contactEmail: 'player@example.com', category: 'false-positive', statement, confirmed: true }

const modes = [
  { id: 'solo', label: 'Solo', matches: 30, flags: 3 },
  { id: 'duo', label: 'Duo', matches: 30, flags: 3 },
]
const dossier = {
  playerId: 'himass',
  handle: 'Himass',
  team: 'Sample Squad',
  caseId: 'FP-2026-001',
  summary: 'Sample case.',
  slaHours: 72,
  deadlineAt: '2026-11-29T10:00:00.000Z',
  serverNow: new Date(1100 + 4000).toISOString(),
  modes,
  appeal: null,
}
const receipt = { id: 'r1', playerId: 'himass', caseId: 'FP-2026-001', submittedAt: '2026-11-26T10:00:00.000Z' }

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
  ok: false,
  status,
  json: async () => {
    throw new SyntaxError('Unexpected end of JSON input')
  },
})
const clock = (...readings) => () => readings.shift()

test('isDossierId accepts a lower-case slug and nothing else', () => {
  for (const ok of ['himass', 'tanvuu', 'a', 'a-1', 'a'.repeat(32)]) assert.equal(isDossierId(ok), true, ok)
  for (const bad of ['', 'Himass', 'a b', '../x', 'a/b', 'a.b', 'a_b', 'a'.repeat(33), 5, null, undefined, {}]) {
    assert.equal(isDossierId(bad), false, String(bad))
  }
})

test('fetchDossiers GETs /api/dossiers and returns the list', async () => {
  const list = [{ playerId: 'himass', handle: 'Himass', caseId: 'FP-2026-001' }]
  const fetchImpl = fakeFetch(() => reply(200, list))
  assert.deepEqual(await fetchDossiers({ fetchImpl }), list)
  assert.equal(fetchImpl.calls[0].url, '/api/dossiers')
})

test('fetchDossiers rejects a payload that is not a list and passes the abort signal on', async () => {
  await assert.rejects(fetchDossiers({ fetchImpl: fakeFetch(() => reply(200, { dossiers: [] })) }), /not a list/)
  const controller = new AbortController()
  const fetchImpl = fakeFetch(() => reply(200, []))
  await fetchDossiers({ fetchImpl, signal: controller.signal })
  assert.equal(fetchImpl.calls[0].init.signal, controller.signal)
})

test('an HTTP error becomes a DossierApiError with the server message and status', async () => {
  const fetchImpl = fakeFetch(() => reply(500, { error: 'Internal server error' }))
  await assert.rejects(fetchDossiers({ fetchImpl }), (err) => {
    assert.ok(err instanceof DossierApiError)
    assert.equal(err.message, 'Internal server error')
    assert.equal(err.status, 500)
    return true
  })
})

test('an HTTP error without a JSON body falls back to the status', async () => {
  await assert.rejects(fetchDossiers({ fetchImpl: fakeFetch(() => noBody(502)) }), (err) => err.status === 502 && /502/.test(err.message))
})

test('an AbortError is not swallowed or wrapped', async () => {
  const fetchImpl = fakeFetch(() => {
    throw new DOMException('aborted', 'AbortError')
  })
  await assert.rejects(fetchDossiers({ fetchImpl }), (err) => err.name === 'AbortError')
})

test('fetchDossier GETs the dossier and returns it with the clock offset of that request', async () => {
  const fetchImpl = fakeFetch(() => reply(200, dossier))
  const result = await fetchDossier('himass', { fetchImpl, now: clock(1000, 1200) })
  assert.equal(fetchImpl.calls[0].url, '/api/dossiers/himass')
  assert.equal(result.dossier.handle, 'Himass')
  assert.equal(result.offsetMs, 4000)
})

test('fetchDossier refuses an id that is not a slug before any request', async () => {
  const fetchImpl = fakeFetch(() => reply(200, dossier))
  for (const bad of ['', 'Himass', '../admin', 'a b', 'a'.repeat(33), 5, undefined]) {
    await assert.rejects(fetchDossier(bad, { fetchImpl }), TypeError, String(bad))
  }
  assert.equal(fetchImpl.calls.length, 0)
})

test('fetchDossier surfaces a 404 with its status', async () => {
  const fetchImpl = fakeFetch(() => reply(404, { error: 'Unknown dossier.' }))
  await assert.rejects(fetchDossier('nobody', { fetchImpl }), (err) => err.status === 404 && err.message === 'Unknown dossier.')
})

test('fetchDossier rejects a payload that does not have the dossier shape', async () => {
  const broken = [
    null,
    [],
    'dossier',
    { ...dossier, playerId: 5 },
    { ...dossier, handle: '' },
    { ...dossier, deadlineAt: 12 },
    { ...dossier, serverNow: 'yesterday' },
    { ...dossier, slaHours: 'many' },
    { ...dossier, slaHours: 0 },
    { ...dossier, modes: 'solo' },
    { ...dossier, modes: [{ id: 'solo', label: 'Solo', matches: -1, flags: 0 }] },
    { ...dossier, modes: [{ id: 'solo', label: 'Solo', matches: 1.5, flags: 0 }] },
    { ...dossier, modes: [{ id: 'solo', label: 'Solo', matches: 1 }] },
    { ...dossier, appeal: 'yes' },
    { ...dossier, appeal: { id: 'r1' } },
  ]
  for (const payload of broken) {
    await assert.rejects(fetchDossier('himass', { fetchImpl: fakeFetch(() => reply(200, payload)), now: clock(1, 2) }), /not valid/, JSON.stringify(payload))
  }
})

test('fetchDossier accepts a dossier that already has an appeal receipt', async () => {
  const result = await fetchDossier('himass', { fetchImpl: fakeFetch(() => reply(200, { ...dossier, appeal: receipt })), now: clock(1000, 1200) })
  assert.deepEqual(result.dossier.appeal, receipt)
})

test('fetchServerTime GETs /api/time and returns the server clock in milliseconds', async () => {
  const fetchImpl = fakeFetch(() => reply(200, { now: '2026-11-26T10:00:00.000Z' }))
  const controller = new AbortController()
  assert.deepEqual(await fetchServerTime({ fetchImpl, signal: controller.signal }), { serverNowMs: Date.UTC(2026, 10, 26, 10) })
  assert.equal(fetchImpl.calls[0].url, '/api/time')
  assert.equal(fetchImpl.calls[0].init.signal, controller.signal)
})

test('fetchServerTime rejects an answer without a valid time and surfaces HTTP errors', async () => {
  for (const payload of [null, {}, { now: 5 }, { now: 'soon' }, []]) {
    await assert.rejects(fetchServerTime({ fetchImpl: fakeFetch(() => reply(200, payload)) }), /not valid/, JSON.stringify(payload))
  }
  await assert.rejects(fetchServerTime({ fetchImpl: fakeFetch(() => reply(503, { error: 'Down.' })) }), (err) => err.status === 503)
})

test('postAppeal POSTs only the four validated fields as JSON, trimmed', async () => {
  const fetchImpl = fakeFetch(() => reply(201, receipt))
  const result = await postAppeal('himass', { ...values, contactEmail: '  player@example.com ', extra: 'dropped', id: 'forged' }, { fetchImpl })
  assert.deepEqual(result, receipt)
  const { url, init } = fetchImpl.calls[0]
  assert.equal(url, '/api/dossiers/himass/appeal')
  assert.equal(init.method, 'POST')
  assert.equal(init.headers['Content-Type'], 'application/json')
  assert.deepEqual(JSON.parse(init.body), { contactEmail: 'player@example.com', category: 'false-positive', statement, confirmed: true })
})

test('postAppeal rejects invalid values with a 400 before any request', async () => {
  const fetchImpl = fakeFetch(() => reply(201, receipt))
  await assert.rejects(postAppeal('himass', { ...values, statement: 'too short' }, { fetchImpl }), (err) => {
    assert.ok(err instanceof DossierApiError)
    assert.equal(err.status, 400)
    assert.match(err.message, /statement/i)
    return true
  })
  assert.equal(fetchImpl.calls.length, 0)
})

test('postAppeal refuses an id that is not a slug before any request', async () => {
  const fetchImpl = fakeFetch(() => reply(201, receipt))
  await assert.rejects(postAppeal('../x', values, { fetchImpl }), TypeError)
  assert.equal(fetchImpl.calls.length, 0)
})

test('postAppeal surfaces the server statuses 404 and 409 with their messages', async () => {
  for (const [status, message] of [[404, 'Unknown dossier.'], [409, 'The appeal window has closed.']]) {
    await assert.rejects(postAppeal('himass', values, { fetchImpl: fakeFetch(() => reply(status, { error: message })) }), (err) => {
      assert.equal(err.status, status)
      assert.equal(err.message, message)
      return true
    })
  }
})

test('postAppeal rejects a 201 answer that is not a receipt', async () => {
  for (const payload of [null, {}, { id: 'r1' }, { ...receipt, submittedAt: 5 }]) {
    await assert.rejects(postAppeal('himass', values, { fetchImpl: fakeFetch(() => reply(201, payload)) }), /not valid/, JSON.stringify(payload))
  }
})
