import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PUBG_VN_SQUADS } from '../data/pubgVnSquads.js'
import { fetchKraftonPubgTelemetry, isKnownSquadId } from './fetchKraftonPubgTelemetry.js'

function createFakeFetch({ ok = true, status = 200, payload = null } = {}) {
  const calls = []
  async function fakeFetch(url, options) {
    calls.push({ url, options })
    if (options?.signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }
    return { ok, status, json: async () => payload }
  }
  return { fakeFetch, calls }
}

const squadById = (id) => PUBG_VN_SQUADS.find((s) => s.id === id)

test('te with random 0.9 resolves to the te payload and passes the signal', async () => {
  const { fakeFetch, calls } = createFakeFetch({ payload: squadById('te') })
  const { signal } = new AbortController()
  const result = await fetchKraftonPubgTelemetry('te', {
    signal,
    fetchImpl: fakeFetch,
    random: () => 0.9,
  })
  assert.deepEqual(result, PUBG_VN_SQUADS[1])
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, '/telemetry/te.json')
  assert.equal(calls[0].options.signal, signal)
})

test('ces with random 0.1 rejects with a packet loss error', async () => {
  const { fakeFetch } = createFakeFetch({ payload: squadById('ces') })
  await assert.rejects(
    fetchKraftonPubgTelemetry('ces', { fetchImpl: fakeFetch, random: () => 0.1 }),
    (err) => {
      assert.ok(err instanceof Error)
      assert.match(err.message, /packet lost/)
      assert.notEqual(err.name, 'AbortError')
      return true
    },
  )
})

test('random exactly 0.35 passes the packet loss boundary', async () => {
  const { fakeFetch } = createFakeFetch({ payload: squadById('ge') })
  const result = await fetchKraftonPubgTelemetry('ge', {
    fetchImpl: fakeFetch,
    random: () => 0.35,
  })
  assert.deepEqual(result, squadById('ge'))
})

test('unknown squad id rejects before any request', async () => {
  const { fakeFetch, calls } = createFakeFetch()
  await assert.rejects(
    fetchKraftonPubgTelemetry('xyz', { fetchImpl: fakeFetch, random: () => 0.9 }),
    /Unknown squad/,
  )
  assert.equal(calls.length, 0)
})

test('HTTP 503 rejects with the status in the message', async () => {
  const { fakeFetch } = createFakeFetch({ ok: false, status: 503 })
  await assert.rejects(
    fetchKraftonPubgTelemetry('te', { fetchImpl: fakeFetch, random: () => 0.9 }),
    /503/,
  )
})

test('payload id that differs from the requested id rejects', async () => {
  const { fakeFetch } = createFakeFetch({ payload: squadById('ces') })
  await assert.rejects(
    fetchKraftonPubgTelemetry('te', { fetchImpl: fakeFetch, random: () => 0.9 }),
    /does not match/,
  )
})

test('an already aborted signal rejects with AbortError', async () => {
  const { fakeFetch } = createFakeFetch({ payload: squadById('te') })
  const c = new AbortController()
  c.abort()
  await assert.rejects(
    fetchKraftonPubgTelemetry('te', { signal: c.signal, fetchImpl: fakeFetch, random: () => 0.9 }),
    (err) => {
      assert.equal(err.name, 'AbortError')
      return true
    },
  )
})

test('isKnownSquadId accepts only whitelisted string ids', () => {
  for (const id of ['ces', 'te', 'ge']) {
    assert.equal(isKnownSquadId(id), true)
  }
  for (const id of ['xyz', '', undefined, 42]) {
    assert.equal(isKnownSquadId(id), false)
  }
})
