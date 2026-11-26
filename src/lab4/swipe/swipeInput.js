/** @typedef {import('./swipe.contract.js').SwipeAction} SwipeAction */
/** @typedef {import('./swipe.contract.js').DeckCommand} DeckCommand */

/** Distance in pixels a pointer must travel to count as a swipe (slide 30). */
export const SWIPE_THRESHOLD_PX = 50

/** @type {Readonly<Record<string, DeckCommand>>} */
const COMMAND_BY_CODE = Object.freeze({
  ArrowRight: 'LIKE',
  ArrowLeft: 'NOPE',
  ArrowUp: 'SUPERLIKE',
  Backspace: 'UNDO',
})

/**
 * Maps `KeyboardEvent.code` to a deck command. Arrow keys and Backspace are not letters, but the
 * code is read for every key so the rule is the same as in Lab 3 (the physical key, not the typed character).
 * @param {unknown} code
 * @returns {DeckCommand | null}
 */
export function keyToCommand(code) {
  return typeof code === 'string' && Object.hasOwn(COMMAND_BY_CODE, code) ? COMMAND_BY_CODE[code] : null
}

/**
 * Decides which swipe, if any, a pointer drag is. The larger axis wins, a tie is not a swipe,
 * and a distance that does not pass the threshold is not a swipe. Down is not a swipe.
 * @param {number} dx   Pointer x at release minus x at press.
 * @param {number} dy   Pointer y at release minus y at press (negative is up).
 * @param {number} [threshold]
 * @returns {SwipeAction | null}
 */
export function classifySwipe(dx, dy, threshold = SWIPE_THRESHOLD_PX) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null
  const horizontal = Math.abs(dx)
  const vertical = Math.abs(dy)
  if (horizontal === vertical) return null
  if (horizontal > vertical) {
    if (dx > threshold) return 'LIKE'
    if (dx < -threshold) return 'NOPE'
    return null
  }
  return dy < -threshold ? 'SUPERLIKE' : null
}
