/** @typedef {import('./swipe.contract.js').SwipeAction} SwipeAction */

/** @type {readonly SwipeAction[]} */
export const SWIPE_ACTIONS = Object.freeze(['LIKE', 'NOPE', 'SUPERLIKE'])

/**
 * The asymmetric score: a like earns twice what a pass costs, and a super like earns the most.
 * @type {Readonly<Record<SwipeAction, number>>}
 */
export const SCORE_BY_ACTION = Object.freeze({ LIKE: 10, NOPE: -5, SUPERLIKE: 25 })

/**
 * @param {unknown} value
 * @returns {value is SwipeAction}
 */
export function isSwipeAction(value) {
  return typeof value === 'string' && Object.hasOwn(SCORE_BY_ACTION, value)
}

/** @param {{ action?: unknown }} swipe */
function pointsOf(swipe) {
  if (!isSwipeAction(swipe.action)) {
    throw new TypeError(`Unknown swipe action: ${String(swipe.action)}`)
  }
  return SCORE_BY_ACTION[swipe.action]
}

/**
 * The score is derived from the history on every render and is never stored.
 * An unknown action throws: it must not be scored as "anything else".
 * @param {readonly { action: SwipeAction }[]} history
 * @returns {number}
 */
export function scoreOf(history) {
  return history.reduce((total, swipe) => total + pointsOf(swipe), 0)
}

/**
 * @param {readonly { action: SwipeAction }[]} history
 * @returns {Record<SwipeAction, number>}
 */
export function statsOf(history) {
  const counts = { LIKE: 0, NOPE: 0, SUPERLIKE: 0 }
  for (const swipe of history) {
    pointsOf(swipe)
    counts[swipe.action] += 1
  }
  return counts
}
