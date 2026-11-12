import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  SAMPLE_DATA_NOTICE,
  DROP_WINDOW_MS,
  SQUAD_STANDINGS,
  CRATE_SEEDS,
  buildSampleCrates,
  buildServerStock,
} from './arenaData.js'

test('SAMPLE_DATA_NOTICE is the exact label and says not official', () => {
  assert.equal(SAMPLE_DATA_NOTICE, 'Sample data, not official PVS results or prices.')
  assert.ok(SAMPLE_DATA_NOTICE.includes('not official'))
})

test('DROP_WINDOW_MS is 600000', () => {
  assert.equal(DROP_WINDOW_MS, 600000)
})

test('SQUAD_STANDINGS holds the four approved squads in order', () => {
  assert.deepEqual(SQUAD_STANDINGS, [
    { squadId: 'te', squadName: 'The Expendables', wwcdCount: 3, placementPts: 58, killPts: 47 },
    { squadId: 'ces', squadName: 'Cerberus Esports', wwcdCount: 2, placementPts: 61, killPts: 39 },
    { squadId: 'ge', squadName: 'Genius Esports', wwcdCount: 2, placementPts: 44, killPts: 52 },
    { squadId: 'agg', squadName: 'AGG', wwcdCount: 1, placementPts: 49, killPts: 33 },
  ])
})

test('squad ids are exactly te, ces, ge, agg with no duplicates', () => {
  const ids = SQUAD_STANDINGS.map((row) => row.squadId)
  assert.deepEqual(ids.toSorted(), ['agg', 'ces', 'ge', 'te'])
  assert.equal(new Set(ids).size, ids.length)
})

test('SQUAD_STANDINGS and each row are frozen', () => {
  assert.ok(Object.isFrozen(SQUAD_STANDINGS))
  for (const row of SQUAD_STANDINGS) {
    assert.ok(Object.isFrozen(row))
  }
})

test('CRATE_SEEDS holds the four approved crates in order', () => {
  assert.deepEqual(CRATE_SEEDS, [
    {
      id: 'vip-pass',
      title: 'PVS Finals VIP Pass + 5,000 G-Coin',
      priceVnd: 1990000,
      remainingStock: 5,
      serverStock: 5,
      dropOffsetMs: 45000,
    },
    {
      id: 'gcoin-600',
      title: 'G-Coin Contraband Crate (600 G-Coin)',
      priceVnd: 149000,
      remainingStock: 3,
      serverStock: 3,
      dropOffsetMs: -60000,
    },
    {
      id: 'gcoin-last',
      title: 'G-Coin Contraband Crate (Last Crate)',
      priceVnd: 149000,
      remainingStock: 1,
      serverStock: 0,
      dropOffsetMs: -60000,
    },
    {
      id: 'early-bird',
      title: 'PVS Finals Early-Bird Pass',
      priceVnd: 990000,
      remainingStock: 2,
      serverStock: 2,
      dropOffsetMs: -1200000,
    },
  ])
})

test('crate ids are unique', () => {
  const ids = CRATE_SEEDS.map((seed) => seed.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('CRATE_SEEDS and each seed are frozen', () => {
  assert.ok(Object.isFrozen(CRATE_SEEDS))
  for (const seed of CRATE_SEEDS) {
    assert.ok(Object.isFrozen(seed))
  }
})

test('buildSampleCrates(1000) offsets each drop from nowMs', () => {
  const crates = buildSampleCrates(1000)
  assert.equal(crates.length, 4)
  const vip = crates.find((crate) => crate.id === 'vip-pass')
  assert.equal(vip.dropEpochMs, 46000)
  const earlyBird = crates.find((crate) => crate.id === 'early-bird')
  assert.equal(earlyBird.dropEpochMs, 1000 - 1200000)
})

test('buildSampleCrates returns PubgCrateDrop objects without server fields', () => {
  const crates = buildSampleCrates(1000)
  assert.deepEqual(crates[0], {
    id: 'vip-pass',
    title: 'PVS Finals VIP Pass + 5,000 G-Coin',
    priceVnd: 1990000,
    remainingStock: 5,
    dropEpochMs: 46000,
  })
  for (const crate of crates) {
    assert.deepEqual(Object.keys(crate), ['id', 'title', 'priceVnd', 'remainingStock', 'dropEpochMs'])
  }
})

test('buildSampleCrates result and each crate are frozen', () => {
  const crates = buildSampleCrates(1000)
  assert.ok(Object.isFrozen(crates))
  for (const crate of crates) {
    assert.ok(Object.isFrozen(crate))
  }
})

test('buildServerStock maps crate id to server stock and is frozen', () => {
  const stock = buildServerStock()
  assert.deepEqual(stock, { 'vip-pass': 5, 'gcoin-600': 3, 'gcoin-last': 0, 'early-bird': 2 })
  assert.equal(stock['gcoin-last'], 0)
  assert.ok(Object.isFrozen(stock))
})
