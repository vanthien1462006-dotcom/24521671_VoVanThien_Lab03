/** @typedef {import('./pubg-vn-arena.contract.js').PubgVnSquadStanding} PubgVnSquadStanding */
/** @typedef {import('./pubg-vn-arena.contract.js').StandingSortKey} StandingSortKey */

export const SORT_OPTIONS = Object.freeze(
  [
    { value: 'wwcd', label: 'WWCD' },
    { value: 'placement', label: 'Placement points' },
    { value: 'kills', label: 'Kill points' },
    { value: 'total', label: 'Total points' },
  ].map(Object.freeze),
)

const FIELD = { wwcd: 'wwcdCount', placement: 'placementPts', kills: 'killPts', total: 'totalPts' }

/**
 * Filters and sorts standings for display. Pure: the input is never changed.
 * Sorts descending by the chosen field; ties break by total points, then by squadId.
 * @param {ReadonlyArray<PubgVnSquadStanding>} rows
 * @param {{ squadId?: string, sortBy?: StandingSortKey }} [options]
 * @returns {Array<PubgVnSquadStanding & { totalPts: number }>}
 */
export function selectStandings(rows, { squadId = 'all', sortBy = 'wwcd' } = {}) {
  if (!Object.hasOwn(FIELD, sortBy)) {
    throw new RangeError(`Unsupported sort key: ${sortBy}`)
  }
  const field = FIELD[sortBy]
  return rows
    .map((row) => ({ ...row, totalPts: row.placementPts + row.killPts }))
    .filter((row) => squadId === 'all' || row.squadId === squadId)
    .toSorted((a, b) => b[field] - a[field] || b.totalPts - a.totalPts || a.squadId.localeCompare(b.squadId))
}
