export const VIEWS = Object.freeze([
  Object.freeze({ id: 'exercises', label: 'Exercises 1–3' }),
  Object.freeze({ id: 'hw1', label: 'HW1 Drum Kit' }),
])

/**
 * Maps a location hash to a view id. Unknown hashes resolve to 'exercises'.
 * @param {string} hash
 * @returns {string}
 */
export function resolveView(hash) {
  const id = hash.startsWith('#') ? hash.slice(1) : hash
  return VIEWS.some((view) => view.id === id) ? id : 'exercises'
}
