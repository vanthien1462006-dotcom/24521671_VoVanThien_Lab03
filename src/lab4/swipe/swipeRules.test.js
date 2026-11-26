import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SCORE_BY_ACTION, SWIPE_ACTIONS, isSwipeAction, scoreOf, statsOf } from './swipeRules.js'

const swipe = (action, n = 1) => ({ id: `s${n}`, profileId: `p${n}`, action })

test('the actions are LIKE, NOPE and SUPERLIKE, frozen', () => {
  assert.deepEqual([...SWIPE_ACTIONS], ['LIKE', 'NOPE', 'SUPERLIKE'])
  assert.ok(Object.isFrozen(SWIPE_ACTIONS))
  assert.ok(Object.isFrozen(SCORE_BY_ACTION))
})

test('the score table is asymmetric: +10, -5, +25', () => {
  assert.deepEqual({ ...SCORE_BY_ACTION }, { LIKE: 10, NOPE: -5, SUPERLIKE: 25 })
})

test('isSwipeAction accepts only the three actions', () => {
  for (const a of SWIPE_ACTIONS) assert.equal(isSwipeAction(a), true)
  for (const a of ['like', 'UNDO', '', 'constructor', '__proto__', null, undefined, 1, {}]) {
    assert.equal(isSwipeAction(a), false, String(a))
  }
})

test('an empty history scores 0', () => {
  assert.equal(scoreOf([]), 0)
})

test('one swipe of each action scores its table value', () => {
  assert.equal(scoreOf([swipe('LIKE')]), 10)
  assert.equal(scoreOf([swipe('NOPE')]), -5)
  assert.equal(scoreOf([swipe('SUPERLIKE')]), 25)
})

test('a mixed history is the sum, and the score can go negative', () => {
  assert.equal(scoreOf([swipe('LIKE', 1), swipe('NOPE', 2), swipe('SUPERLIKE', 3), swipe('NOPE', 4)]), 25)
  assert.equal(scoreOf([swipe('NOPE', 1), swipe('NOPE', 2)]), -10)
})

test('a SUPERLIKE is not scored as "anything else" (-5)', () => {
  assert.notEqual(scoreOf([swipe('SUPERLIKE')]), -5)
})

test('an unknown action throws instead of scoring', () => {
  assert.throws(() => scoreOf([swipe('MAYBE')]), TypeError)
  assert.throws(() => scoreOf([swipe('constructor')]), TypeError)
  assert.throws(() => scoreOf([{ id: 'x' }]), TypeError)
})

test('scoreOf and statsOf do not mutate the history', () => {
  const history = Object.freeze([Object.freeze(swipe('LIKE', 1)), Object.freeze(swipe('NOPE', 2))])
  scoreOf(history)
  statsOf(history)
  assert.equal(history.length, 2)
})

test('statsOf counts each action, with zeros for the missing ones', () => {
  assert.deepEqual(statsOf([]), { LIKE: 0, NOPE: 0, SUPERLIKE: 0 })
  assert.deepEqual(statsOf([swipe('LIKE', 1), swipe('LIKE', 2), swipe('SUPERLIKE', 3)]), {
    LIKE: 2,
    NOPE: 0,
    SUPERLIKE: 1,
  })
})

test('statsOf throws on an unknown action', () => {
  assert.throws(() => statsOf([swipe('MAYBE')]), TypeError)
})
