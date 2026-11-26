import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EMPTY_HISTORY, peekSwipe, popSwipe, pushSwipe } from './swipeHistory.js'

const entry = (n, action = 'LIKE') => ({ id: `s${n}`, profileId: `p${n}`, action })

test('EMPTY_HISTORY is an empty frozen list', () => {
  assert.deepEqual([...EMPTY_HISTORY], [])
  assert.ok(Object.isFrozen(EMPTY_HISTORY))
})

test('pushSwipe appends to the top and returns a new frozen list', () => {
  const next = pushSwipe(EMPTY_HISTORY, entry(1))
  assert.deepEqual(next.map((e) => e.id), ['s1'])
  assert.notEqual(next, EMPTY_HISTORY)
  assert.ok(Object.isFrozen(next))
})

test('pushSwipe never mutates its input', () => {
  const base = pushSwipe(EMPTY_HISTORY, entry(1))
  pushSwipe(base, entry(2))
  assert.equal(base.length, 1)
  assert.equal(EMPTY_HISTORY.length, 0)
})

test('peekSwipe returns the newest entry, or null when empty', () => {
  assert.equal(peekSwipe(EMPTY_HISTORY), null)
  const history = pushSwipe(pushSwipe(EMPTY_HISTORY, entry(1)), entry(2))
  assert.equal(peekSwipe(history).id, 's2')
})

test('popSwipe removes the newest entry and returns it', () => {
  const history = pushSwipe(pushSwipe(EMPTY_HISTORY, entry(1)), entry(2))
  const { history: rest, removed } = popSwipe(history)
  assert.equal(removed.id, 's2')
  assert.deepEqual(rest.map((e) => e.id), ['s1'])
  assert.ok(Object.isFrozen(rest))
})

test('popSwipe never mutates its input', () => {
  const history = pushSwipe(pushSwipe(EMPTY_HISTORY, entry(1)), entry(2))
  popSwipe(history)
  assert.equal(history.length, 2)
})

test('the stack is last in, first out', () => {
  let history = EMPTY_HISTORY
  for (const n of [1, 2, 3]) history = pushSwipe(history, entry(n))
  const order = []
  for (let i = 0; i < 3; i += 1) {
    const result = popSwipe(history)
    order.push(result.removed.id)
    history = result.history
  }
  assert.deepEqual(order, ['s3', 's2', 's1'])
  assert.equal(history.length, 0)
})

test('popSwipe on an empty history removes nothing', () => {
  const { history, removed } = popSwipe(EMPTY_HISTORY)
  assert.equal(removed, null)
  assert.equal(history.length, 0)
  assert.ok(Object.isFrozen(history))
})

test('a push after a pop puts the new entry on top', () => {
  const afterPop = popSwipe(pushSwipe(pushSwipe(EMPTY_HISTORY, entry(1)), entry(2))).history
  const next = pushSwipe(afterPop, entry(3, 'NOPE'))
  assert.deepEqual(next.map((e) => e.id), ['s1', 's3'])
})
