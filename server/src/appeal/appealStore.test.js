import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createAppealStore } from './appealStore.js'

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
const input = Object.freeze({
  contactEmail: 'player@example.com',
  category: 'false-positive',
  statement: 'This statement is long enough to be accepted by the validator of the tests.',
  confirmed: true,
})

/** A store with a clock the test can move. */
function makeStore() {
  const clock = { ms: START }
  let n = 0
  const store = createAppealStore({ dossiers: DOSSIERS, now: () => new Date(clock.ms), makeId: () => `appeal-${(n += 1)}` })
  return { store, clock }
}

test('listDossiers returns a summary of each case, in order', () => {
  const { store } = makeStore()
  assert.deepEqual(store.listDossiers(), [
    { playerId: 'himass', handle: 'Himass', caseId: 'FP-2026-001' },
    { playerId: 'tanvuu', handle: 'TanVuu', caseId: 'FP-2026-002' },
  ])
})

test('getDossier returns the case with the deadline and the server time from the store clock', () => {
  const { store, clock } = makeStore()
  clock.ms = START + 5 * 60_000
  const dossier = store.getDossier('himass')
  assert.equal(dossier.handle, 'Himass')
  assert.equal(dossier.caseId, 'FP-2026-001')
  assert.equal(dossier.slaHours, 72)
  assert.equal(dossier.deadlineAt, new Date(START + 72 * HOUR).toISOString())
  assert.equal(dossier.serverNow, new Date(START + 5 * 60_000).toISOString())
  assert.equal(dossier.appeal, null)
  assert.deepEqual(dossier.modes, [{ id: 'solo', label: 'Solo', matches: 30, flags: 3 }])
})

test('each case has its own window, counted from the moment the store was created', () => {
  const { store, clock } = makeStore()
  clock.ms = START + 10 * HOUR
  assert.equal(store.getDossier('himass').deadlineAt, new Date(START + 72 * HOUR).toISOString())
  assert.equal(store.getDossier('tanvuu').deadlineAt, new Date(START + 48 * HOUR).toISOString())
})

test('getDossier is null for an unknown id, including names that exist on every object', () => {
  const { store } = makeStore()
  for (const id of ['nobody', 'constructor', '__proto__', 'toString', '']) assert.equal(store.getDossier(id), null, id)
})

test('what getDossier returns is a copy: changing it does not change the store', () => {
  const { store } = makeStore()
  const dossier = store.getDossier('himass')
  dossier.handle = 'Changed'
  dossier.modes[0].matches = 999
  assert.equal(store.getDossier('himass').handle, 'Himass')
  assert.equal(store.getDossier('himass').modes[0].matches, 30)
})

test('now returns the store clock as an ISO 8601 UTC string', () => {
  const { store, clock } = makeStore()
  clock.ms = START + 1234
  assert.equal(store.now(), new Date(START + 1234).toISOString())
})

test('submitAppeal stores an appeal and returns a receipt with a server id and date', () => {
  const { store, clock } = makeStore()
  clock.ms = START + HOUR
  const result = store.submitAppeal('himass', input)
  assert.deepEqual(result, {
    receipt: { id: 'appeal-1', playerId: 'himass', caseId: 'FP-2026-001', submittedAt: new Date(START + HOUR).toISOString() },
  })
})

test('after an appeal the dossier shows the receipt and the window no longer takes a second one', () => {
  const { store } = makeStore()
  const { receipt } = store.submitAppeal('himass', input)
  assert.deepEqual(store.getDossier('himass').appeal, receipt)
  assert.deepEqual(store.submitAppeal('himass', input), { failure: 'duplicate' })
  assert.equal(store.getDossier('tanvuu').appeal, null)
})

test('another case can still be appealed', () => {
  const { store } = makeStore()
  store.submitAppeal('himass', input)
  assert.ok('receipt' in store.submitAppeal('tanvuu', input))
})

test('an unknown case is reported as not found', () => {
  const { store } = makeStore()
  for (const id of ['nobody', 'constructor', '__proto__']) assert.deepEqual(store.submitAppeal(id, input), { failure: 'not-found' }, id)
})

test('the window closes exactly at the deadline, judged with the store clock', () => {
  const { store, clock } = makeStore()
  clock.ms = START + 48 * HOUR - 1
  assert.ok('receipt' in store.submitAppeal('tanvuu', input))
  const other = makeStore()
  other.clock.ms = START + 48 * HOUR
  assert.deepEqual(other.store.submitAppeal('tanvuu', input), { failure: 'closed' })
  other.clock.ms = START + 100 * HOUR
  assert.deepEqual(other.store.submitAppeal('himass', input), { failure: 'closed' })
})

test('an appeal made in time is still shown after the window has closed', () => {
  const { store, clock } = makeStore()
  const { receipt } = store.submitAppeal('tanvuu', input)
  clock.ms = START + 60 * HOUR
  assert.deepEqual(store.getDossier('tanvuu').appeal, receipt)
  assert.deepEqual(store.submitAppeal('tanvuu', input), { failure: 'duplicate' })
})

test('the statement and the email are never returned by the store', () => {
  const { store } = makeStore()
  store.submitAppeal('himass', input)
  const everything = JSON.stringify([store.listDossiers(), store.getDossier('himass'), store.getDossier('tanvuu')])
  assert.ok(!everything.includes(input.statement))
  assert.ok(!everything.includes(input.contactEmail))
})

test('the input is not modified', () => {
  const { store } = makeStore()
  const copy = { ...input }
  store.submitAppeal('himass', copy)
  assert.deepEqual(copy, input)
})

test('ids come from crypto.randomUUID by default', () => {
  const store = createAppealStore({ dossiers: DOSSIERS })
  const { receipt } = store.submitAppeal('himass', input)
  assert.match(receipt.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
})
