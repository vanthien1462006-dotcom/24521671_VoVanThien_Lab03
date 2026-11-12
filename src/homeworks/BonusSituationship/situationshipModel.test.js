import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  PHASES,
  EFFORT_WEIGHTS,
  transition,
  computeImpacts,
  isRedFlag,
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
