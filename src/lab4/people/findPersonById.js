/** @typedef {import('../../contracts/scientist-directory.contract.js').Pioneer} Pioneer */

/**
 * Looks up the person named by a route parameter. The id is untrusted URL input.
 * @param {readonly Pioneer[]} people
 * @param {unknown} id   Value from useParams().
 * @returns {Pioneer | null}   null means "render the 404 state".
 */
export function findPersonById(people, id) {
  if (typeof id !== 'string') return null
  return people.find((p) => p.id === id) ?? null
}
