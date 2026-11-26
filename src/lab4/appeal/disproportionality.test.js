import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MIN_TOTAL_EVENTS, OVER_THRESHOLD, UNDER_THRESHOLD, computeMatrix } from './disproportionality.js'

const row = (id, exposure, events) => ({ id, label: id.toUpperCase(), exposure, events })
const byId = (cells, id) => cells.find((cell) => cell.id === id)

test('the thresholds and the minimum sample are the documented ones', () => {
  assert.equal(OVER_THRESHOLD, 1.25)
  assert.equal(UNDER_THRESHOLD, 0.8)
  assert.equal(MIN_TOTAL_EVENTS, 5)
})

test('an empty list gives an empty matrix', () => {
  assert.deepEqual(computeMatrix([]), [])
})

test('shares add up to 1 on both sides', () => {
  const cells = computeMatrix([row('solo', 30, 3), row('duo', 30, 3), row('squad', 40, 6)])
  assert.equal(cells.reduce((sum, c) => sum + c.exposureShare, 0), 1)
  assert.ok(Math.abs(cells.reduce((sum, c) => sum + c.eventShare, 0) - 1) < 1e-12)
})

test('the index is the share of flags divided by the share of matches', () => {
  const cells = computeMatrix([row('solo', 20, 1), row('duo', 30, 6), row('squad', 50, 5)])
  const duo = byId(cells, 'duo')
  assert.equal(duo.exposureShare, 0.3)
  assert.equal(duo.eventShare, 0.5)
  assert.ok(Math.abs(duo.index - 0.5 / 0.3) < 1e-12)
  assert.equal(duo.verdict, 'over')
})

test('an index of exactly 1.25 is still proportional, and just above it is over', () => {
  const edge = byId(computeMatrix([row('a', 40, 6), row('b', 60, 6)]), 'a')
  assert.equal(edge.index, 1.25)
  assert.equal(edge.verdict, 'proportional')
  const above = byId(computeMatrix([row('a', 40, 7), row('b', 60, 5)]), 'a')
  assert.ok(above.index > 1.25)
  assert.equal(above.verdict, 'over')
})

test('an index of exactly 0.8 is still proportional, and just below it is under', () => {
  const edge = byId(computeMatrix([row('a', 50, 4), row('b', 50, 6)]), 'a')
  assert.equal(edge.index, 0.8)
  assert.equal(edge.verdict, 'proportional')
  const below = byId(computeMatrix([row('a', 50, 3), row('b', 50, 7)]), 'a')
  assert.ok(below.index < 0.8)
  assert.equal(below.verdict, 'under')
})

test('flags spread exactly like matches give an index of 1 everywhere', () => {
  for (const cell of computeMatrix([row('a', 10, 1), row('b', 20, 2), row('c', 70, 7)])) {
    assert.equal(cell.index, 1, cell.id)
    assert.equal(cell.verdict, 'proportional')
  }
})

test('the index is exact for integers, with no floating point drift', () => {
  // 0.1 + 0.2 style shares would round the edge case the other way.
  const cells = computeMatrix([row('a', 3, 3), row('b', 7, 7)])
  assert.equal(byId(cells, 'a').index, 1)
  assert.equal(byId(cells, 'b').index, 1)
})

test('a row with no matches cannot be judged', () => {
  const cell = byId(computeMatrix([row('a', 0, 0), row('b', 50, 10)]), 'a')
  assert.equal(cell.index, null)
  assert.equal(cell.verdict, 'insufficient')
  assert.equal(cell.exposureShare, 0)
})

test('a row with matches but no flags has index 0 and is under', () => {
  const cell = byId(computeMatrix([row('a', 50, 0), row('b', 50, 10)]), 'a')
  assert.equal(cell.index, 0)
  assert.equal(cell.verdict, 'under')
})

test('fewer than 5 flags in total is too small a sample: every row is insufficient', () => {
  for (const cell of computeMatrix([row('a', 50, 4), row('b', 50, 0)])) {
    assert.equal(cell.verdict, 'insufficient', cell.id)
    assert.equal(cell.index, null)
  }
  assert.equal(computeMatrix([row('a', 50, 3), row('b', 50, 2)])[0].verdict !== 'insufficient', true)
})

test('no matches at all, or no flags at all, gives insufficient rows and zero shares, never NaN', () => {
  for (const rows of [[row('a', 0, 0), row('b', 0, 0)], [row('a', 10, 0), row('b', 10, 0)]]) {
    for (const cell of computeMatrix(rows)) {
      assert.equal(cell.verdict, 'insufficient')
      assert.equal(cell.index, null)
      assert.ok(Number.isFinite(cell.exposureShare) && Number.isFinite(cell.eventShare))
    }
  }
})

test('a row that is not an object or has a bad number throws TypeError', () => {
  const bad = [
    null,
    'solo',
    row('a', -1, 0),
    row('a', 1.5, 0),
    row('a', 1, 0.5),
    row('a', Number.NaN, 0),
    row('a', Infinity, 0),
    row('a', '10', 1),
    row('a', Number.MAX_SAFE_INTEGER + 2, 1),
    { id: 'a', label: 'A', exposure: 1 },
  ]
  for (const entry of bad) assert.throws(() => computeMatrix([entry]), TypeError, JSON.stringify(entry))
})

test('rows must be an array and ids must be unique strings', () => {
  assert.throws(() => computeMatrix(null), TypeError)
  assert.throws(() => computeMatrix({}), TypeError)
  assert.throws(() => computeMatrix([row('a', 1, 1), row('a', 2, 2)]), TypeError)
  assert.throws(() => computeMatrix([{ id: 7, label: 'x', exposure: 1, events: 1 }]), TypeError)
})

test('the order of the rows is kept and the input is not mutated', () => {
  const input = Object.freeze([Object.freeze(row('b', 10, 2)), Object.freeze(row('a', 10, 8))])
  const cells = computeMatrix(input)
  assert.deepEqual(cells.map((c) => c.id), ['b', 'a'])
  assert.equal(input[0].exposure, 10)
})

test('the result and its cells are frozen, and the label is copied through', () => {
  const cells = computeMatrix([row('a', 10, 5)])
  assert.ok(Object.isFrozen(cells))
  assert.ok(Object.isFrozen(cells[0]))
  assert.equal(cells[0].label, 'A')
  assert.equal(cells[0].exposure, 10)
  assert.equal(cells[0].events, 5)
})
