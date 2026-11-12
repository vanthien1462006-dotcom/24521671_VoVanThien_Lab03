import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SORT_OPTIONS, selectStandings } from './standings.js'
import { SQUAD_STANDINGS } from './arenaData.js'

function ids(rows) {
  return rows.map((row) => row.squadId)
}

test('SORT_OPTIONS lists the four sort keys with labels and is frozen', () => {
  assert.deepEqual(SORT_OPTIONS, [
    { value: 'wwcd', label: 'WWCD' },
    { value: 'placement', label: 'Placement points' },
    { value: 'kills', label: 'Kill points' },
    { value: 'total', label: 'Total points' },
  ])
  assert.ok(Object.isFrozen(SORT_OPTIONS))
  for (const option of SORT_OPTIONS) {
    assert.ok(Object.isFrozen(option))
  }
})

const sortRows = [
  { sortBy: 'wwcd', expected: ['te', 'ces', 'ge', 'agg'] },
  { sortBy: 'placement', expected: ['ces', 'te', 'agg', 'ge'] },
  { sortBy: 'kills', expected: ['ge', 'te', 'ces', 'agg'] },
  { sortBy: 'total', expected: ['te', 'ces', 'ge', 'agg'] },
]

for (const { sortBy, expected } of sortRows) {
  test(`selectStandings all squads sorted by ${sortBy}`, () => {
    assert.deepEqual(ids(selectStandings(SQUAD_STANDINGS, { squadId: 'all', sortBy })), expected)
  })
}

test('selectStandings filters to one squad', () => {
  assert.deepEqual(ids(selectStandings(SQUAD_STANDINGS, { squadId: 'agg', sortBy: 'wwcd' })), ['agg'])
})

test('selectStandings with an unknown sortBy throws RangeError', () => {
  assert.throws(() => selectStandings(SQUAD_STANDINGS, { squadId: 'all', sortBy: 'unknown' }), RangeError)
})

test('selectStandings defaults to all squads sorted by wwcd', () => {
  assert.deepEqual(ids(selectStandings(SQUAD_STANDINGS)), ['te', 'ces', 'ge', 'agg'])
})

test('each row gains totalPts as placement plus kill points', () => {
  const byId = Object.fromEntries(selectStandings(SQUAD_STANDINGS).map((row) => [row.squadId, row.totalPts]))
  assert.deepEqual(byId, { te: 105, ces: 100, ge: 96, agg: 82 })
})

test('selectStandings keeps the original fields of every row', () => {
  const [first] = selectStandings(SQUAD_STANDINGS, { sortBy: 'wwcd' })
  assert.deepEqual(first, { ...SQUAD_STANDINGS[0], totalPts: 105 })
})

test('ties break by total points, then by squadId', () => {
  const rows = [
    { squadId: 'b', squadName: 'B', wwcdCount: 1, placementPts: 10, killPts: 10 },
    { squadId: 'a', squadName: 'A', wwcdCount: 1, placementPts: 10, killPts: 10 },
    { squadId: 'c', squadName: 'C', wwcdCount: 1, placementPts: 20, killPts: 10 },
  ]
  assert.deepEqual(ids(selectStandings(rows, { sortBy: 'wwcd' })), ['c', 'a', 'b'])
})

test('selectStandings does not change the input array or its rows', () => {
  const input = Object.freeze(SQUAD_STANDINGS.map((row) => Object.freeze({ ...row })))
  const before = JSON.stringify(input)
  const result = selectStandings(input, { squadId: 'all', sortBy: 'kills' })
  assert.notEqual(result, input)
  assert.equal(JSON.stringify(input), before)
  assert.ok(input.every((row) => !('totalPts' in row)))
})
