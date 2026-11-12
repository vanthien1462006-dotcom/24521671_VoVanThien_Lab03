/** @typedef {import('./pubg-vn-arena.contract.js').PubgCrateDrop} PubgCrateDrop */
/** @typedef {import('./pubg-vn-arena.contract.js').PubgVnSquadStanding} PubgVnSquadStanding */

export const SAMPLE_DATA_NOTICE = 'Sample data, not official PVS results or prices.'

export const DROP_WINDOW_MS = 600000

/** @type {ReadonlyArray<Readonly<PubgVnSquadStanding>>} */
export const SQUAD_STANDINGS = Object.freeze([
  Object.freeze({ squadId: 'te', squadName: 'The Expendables', wwcdCount: 3, placementPts: 58, killPts: 47 }),
  Object.freeze({ squadId: 'ces', squadName: 'Cerberus Esports', wwcdCount: 2, placementPts: 61, killPts: 39 }),
  Object.freeze({ squadId: 'ge', squadName: 'Genius Esports', wwcdCount: 2, placementPts: 44, killPts: 52 }),
  Object.freeze({ squadId: 'agg', squadName: 'AGG', wwcdCount: 1, placementPts: 49, killPts: 33 }),
])

export const CRATE_SEEDS = Object.freeze([
  Object.freeze({
    id: 'vip-pass',
    title: 'PVS Finals VIP Pass + 5,000 G-Coin',
    priceVnd: 1990000,
    remainingStock: 5,
    serverStock: 5,
    dropOffsetMs: 45000,
  }),
  Object.freeze({
    id: 'gcoin-600',
    title: 'G-Coin Contraband Crate (600 G-Coin)',
    priceVnd: 149000,
    remainingStock: 3,
    serverStock: 3,
    dropOffsetMs: -60000,
  }),
  Object.freeze({
    id: 'gcoin-last',
    title: 'G-Coin Contraband Crate (Last Crate)',
    priceVnd: 149000,
    remainingStock: 1,
    serverStock: 0,
    dropOffsetMs: -60000,
  }),
  Object.freeze({
    id: 'early-bird',
    title: 'PVS Finals Early-Bird Pass',
    priceVnd: 990000,
    remainingStock: 2,
    serverStock: 2,
    dropOffsetMs: -1200000,
  }),
])

/**
 * Builds the crates shown in the arena, with drop times relative to nowMs.
 * @param {number} nowMs
 * @returns {ReadonlyArray<Readonly<PubgCrateDrop>>}
 */
export function buildSampleCrates(nowMs) {
  return Object.freeze(
    CRATE_SEEDS.map(({ id, title, priceVnd, remainingStock, dropOffsetMs }) =>
      Object.freeze({ id, title, priceVnd, remainingStock, dropEpochMs: nowMs + dropOffsetMs }),
    ),
  )
}

/**
 * Initial stock held by the mock server, by crate id.
 * @returns {Readonly<Record<string, number>>}
 */
export function buildServerStock() {
  return Object.freeze(Object.fromEntries(CRATE_SEEDS.map(({ id, serverStock }) => [id, serverStock])))
}
