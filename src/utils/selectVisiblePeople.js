/** @typedef {import('../contracts/scientist-directory.contract.js').Pioneer} Pioneer */
/** @typedef {import('../contracts/scientist-directory.contract.js').PioneerFilter} PioneerFilter */

const COMPARATORS = {
  'iq-desc': (a, b) => b.iq - a.iq,
  'age-asc': (a, b) => a.age - b.age,
}

/**
 * Filters people by name and minimum IQ, then sorts them. Never mutates the input.
 * @param {readonly Pioneer[]} people
 * @param {Partial<PioneerFilter>} [filter]
 * @returns {Pioneer[]}
 */
export function selectVisiblePeople(people, { query = '', minIq = 0, sortBy = 'iq-desc' } = {}) {
  const q = query.trim().toLowerCase()
  const matches = people.filter((p) => p.name.toLowerCase().includes(q) && p.iq >= minIq)
  const compare = Object.hasOwn(COMPARATORS, sortBy) ? COMPARATORS[sortBy] : null
  return compare ? matches.toSorted(compare) : matches
}
