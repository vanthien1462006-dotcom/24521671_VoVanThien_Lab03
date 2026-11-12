import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  PHASES,
  EFFORT_WEIGHTS,
  transition,
  computeImpacts,
  isRedFlag,
  createSignal,
  appendSignal,
  latestSignals,
  sanitizeCount,
} from './situationshipModel.js'

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `expected ${expected}, got ${actual}`)
}

test('PHASES and EFFORT_WEIGHTS are frozen constants', () => {
  assert.deepEqual(PHASES, ['FRIENDS', 'DATING_NO_LOVE', 'OFFICIAL_LOVE', 'GHOSTED_EXIT'])
  assert.ok(Object.isFrozen(PHASES))
  assert.deepEqual(EFFORT_WEIGHTS, { EM: 0.1, AI_DO: 50 })
  assert.ok(Object.isFrozen(EFFORT_WEIGHTS))
})

const TRANSITION_ROWS = [
  ['FRIENDS', 'START_DATING', 'DATING_NO_LOVE'],
  ['DATING_NO_LOVE', 'CONFIRM_LOVE', 'OFFICIAL_LOVE'],
  ['DATING_NO_LOVE', 'GHOST_TIMEOUT', 'GHOSTED_EXIT'],
  ['FRIENDS', 'UNBIND', 'GHOSTED_EXIT'],
  ['DATING_NO_LOVE', 'UNBIND', 'GHOSTED_EXIT'],
  ['OFFICIAL_LOVE', 'UNBIND', 'GHOSTED_EXIT'],
  ['GHOSTED_EXIT', 'RESET', 'FRIENDS'],
  ['OFFICIAL_LOVE', 'GHOST_TIMEOUT', 'OFFICIAL_LOVE'],
  ['GHOSTED_EXIT', 'START_DATING', 'GHOSTED_EXIT'],
  ['FRIENDS', 'CONFIRM_LOVE', 'FRIENDS'],
]

for (const [phase, event, expected] of TRANSITION_ROWS) {
  test(`transition(${phase}, ${event}) -> ${expected}`, () => {
    assert.equal(transition(phase, event), expected)
  })
}

test("transition('NOPE', START_DATING) throws TypeError", () => {
  assert.throws(() => transition('NOPE', 'START_DATING'), TypeError)
})

const IMPACT_ROWS = [
  [100, 1, { myImpact: 10, rivalImpact: 50, emShare: 1 / 6 }],
  [500, 1, { myImpact: 50, rivalImpact: 50, emShare: 0.5 }],
  [0, 0, { myImpact: 0, rivalImpact: 0, emShare: 0 }],
]

for (const [myTries, rivalTries, expected] of IMPACT_ROWS) {
  test(`computeImpacts(${myTries}, ${rivalTries})`, () => {
    const result = computeImpacts(myTries, rivalTries)
    near(result.myImpact, expected.myImpact)
    near(result.rivalImpact, expected.rivalImpact)
    near(result.emShare, expected.emShare)
  })
}

const RED_FLAG_ROWS = [
  ['DATING_NO_LOVE', 10, 50, true],
  ['DATING_NO_LOVE', 50, 50, false],
  ['OFFICIAL_LOVE', 10, 50, false],
  ['FRIENDS', 10, 50, false],
]

for (const [phase, myImpact, rivalImpact, expected] of RED_FLAG_ROWS) {
  test(`isRedFlag(${phase}, ${myImpact}, ${rivalImpact}) -> ${expected}`, () => {
    assert.equal(isRedFlag(phase, myImpact, rivalImpact), expected)
  })
}

test('createSignal builds a frozen EM signal with weight 0.1', () => {
  const signal = createSignal('EM', 1, () => 'id-1')
  assert.deepEqual(signal, {
    id: 'id-1',
    actor: 'EM',
    type: 'EM',
    steps: 1,
    multiplier: 0.1,
    impact: 0.1,
  })
  assert.ok(Object.isFrozen(signal))
})

test('createSignal builds an AI_DO signal with impact 50', () => {
  const signal = createSignal('AI_DO', 1, () => 'id-2')
  assert.equal(signal.multiplier, 50)
  assert.equal(signal.impact, 50)
  assert.equal(signal.type, 'AI_DO')
})

test('createSignal uses crypto.randomUUID by default', () => {
  const signal = createSignal('EM', 2)
  assert.match(signal.id, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  near(signal.impact, 0.2)
})

test('createSignal rejects an unknown actor with TypeError', () => {
  assert.throws(() => createSignal('X', 1, () => 'id-3'), TypeError)
  assert.throws(() => createSignal('toString', 1, () => 'id-4'), TypeError)
})

test('appendSignal returns a new frozen array and leaves the input unchanged', () => {
  const first = createSignal('EM', 1, () => 'a')
  const second = createSignal('AI_DO', 1, () => 'b')
  const log = Object.freeze([first])
  const next = appendSignal(log, second)
  assert.notEqual(next, log)
  assert.deepEqual(next, [first, second])
  assert.ok(Object.isFrozen(next))
  assert.deepEqual(log, [first])
  assert.equal(log.length, 1)
})

test('latestSignals returns at most 10, newest first', () => {
  const log = Object.freeze(
    Array.from({ length: 12 }, (_, i) => createSignal('EM', 1, () => `s-${i}`)),
  )
  const latest = latestSignals(log, 10)
  assert.equal(latest.length, 10)
  assert.equal(latest[0], log[11])
  assert.equal(latest[9], log[2])
  assert.equal(log.length, 12)
  assert.equal(log[0].id, 's-0')
})

test('latestSignals defaults to 10 and handles short or empty logs', () => {
  const log = Object.freeze([
    createSignal('EM', 1, () => 'a'),
    createSignal('AI_DO', 1, () => 'b'),
  ])
  assert.deepEqual(
    latestSignals(log).map((signal) => signal.id),
    ['b', 'a'],
  )
  assert.deepEqual(latestSignals(Object.freeze([])), [])
  assert.equal(latestSignals(Array.from({ length: 12 }, () => log[0])).length, 10)
})

const SANITIZE_ROWS = [
  [NaN, 0],
  [-3, 0],
  [2.7, 2],
  [42, 42],
]

for (const [input, expected] of SANITIZE_ROWS) {
  test(`sanitizeCount(${input}) -> ${expected}`, () => {
    assert.equal(sanitizeCount(input), expected)
  })
}
