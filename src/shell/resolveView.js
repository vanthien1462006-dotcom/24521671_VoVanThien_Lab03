export const VIEWS = Object.freeze([
  Object.freeze({ id: 'exercises', label: 'Exercises 1–3' }),
  Object.freeze({ id: 'hw1', label: 'HW1 Drum Kit' }),
  Object.freeze({ id: 'hw2', label: 'HW2 Piano 88' }),
  Object.freeze({ id: 'hw3', label: 'HW3 PUBG VN Arena' }),
  Object.freeze({ id: 'bonus', label: 'Bonus Exercise' }),
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
