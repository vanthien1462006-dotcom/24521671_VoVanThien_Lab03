import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DB_FLOOR, toDecibels } from './levels.js'

test('DB_FLOOR is -60', () => {
  assert.equal(DB_FLOOR, -60)
})

test('[] -> -60', () => {
  assert.equal(toDecibels([]), -60)
})

test('[0, 0, 0] -> -60', () => {
  assert.equal(toDecibels([0, 0, 0]), -60)
})

test('[1, -1] -> 0', () => {
  assert.equal(toDecibels([1, -1]), 0)
})

test('[0.5, -0.5] -> -6', () => {
  assert.equal(toDecibels([0.5, -0.5]), -6)
})

test('[0.001, -0.001] -> -60', () => {
  assert.equal(toDecibels([0.001, -0.001]), -60)
})

test('[2, -2] -> 0', () => {
  assert.equal(toDecibels([2, -2]), 0)
})

test('Float32Array [0.5, -0.5] -> -6', () => {
  assert.equal(toDecibels(Float32Array.from([0.5, -0.5])), -6)
})
