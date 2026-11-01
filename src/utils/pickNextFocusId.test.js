import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pickNextFocusId } from './pickNextFocusId.js'

test('returns the next id when the first item is deleted', () => {
  assert.equal(pickNextFocusId(['a', 'b', 'c'], 'a'), 'b')
})

test('returns the next id when a middle item is deleted', () => {
  assert.equal(pickNextFocusId(['a', 'b', 'c'], 'b'), 'c')
})

test('returns the previous id when the last item is deleted', () => {
  assert.equal(pickNextFocusId(['a', 'b', 'c'], 'c'), 'b')
})

test('returns null when the only item is deleted', () => {
  assert.equal(pickNextFocusId(['a'], 'a'), null)
})

test('returns null for an empty list', () => {
  assert.equal(pickNextFocusId([], 'a'), null)
})

test('returns null when the id is not in the list', () => {
  assert.equal(pickNextFocusId(['a', 'b'], 'x'), null)
})

test('does not mutate its input', () => {
  const ids = ['a', 'b', 'c']
  pickNextFocusId(ids, 'b')
  assert.deepEqual(ids, ['a', 'b', 'c'])
})
