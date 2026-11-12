import { test } from 'node:test'
import assert from 'node:assert/strict'
import { VIEWS, resolveView } from './resolveView.js'

const rows = [
  ['', 'exercises'],
  ['#', 'exercises'],
  ['#exercises', 'exercises'],
  ['#hw1', 'hw1'],
  ['#hw2', 'hw2'],
  ['#hw3', 'hw3'],
  ['hw1', 'hw1'],
  ['#HW1', 'exercises'],
  ['#hw9', 'exercises'],
]

for (const [hash, expected] of rows) {
  test(`resolveView(${JSON.stringify(hash)}) -> ${expected}`, () => {
    assert.equal(resolveView(hash), expected)
  })
}

test('VIEWS is frozen with frozen entries', () => {
  assert.ok(Object.isFrozen(VIEWS))
  for (const view of VIEWS) {
    assert.ok(Object.isFrozen(view))
  }
})

test('VIEWS ids are unique', () => {
  const ids = VIEWS.map((v) => v.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('VIEWS lists exercises, hw1, hw2 and hw3 in that order', () => {
  assert.equal(VIEWS.length, 4)
  assert.deepEqual(
    VIEWS.map((v) => [v.id, v.label]),
    [
      ['exercises', 'Exercises 1–3'],
      ['hw1', 'HW1 Drum Kit'],
      ['hw2', 'HW2 Piano 88'],
      ['hw3', 'HW3 PUBG VN Arena'],
    ],
  )
})
