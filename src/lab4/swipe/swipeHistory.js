/**
 * The undo stack. The history is a list of saved swipes, oldest first; the top of the stack is the
 * newest swipe. Every function returns a new frozen list and never mutates its input.
 * @template T
 * @typedef {readonly T[]} Stack
 */

/** @type {readonly never[]} */
export const EMPTY_HISTORY = Object.freeze([])

/**
 * @template T
 * @param {readonly T[]} history
 * @param {T} entry
 * @returns {readonly T[]}
 */
export function pushSwipe(history, entry) {
  return Object.freeze([...history, entry])
}

/**
 * Removes the newest entry. The removed entry is returned so the caller can tell the server
 * which swipe was undone (`removed` is null when there is nothing to undo).
 * @template T
 * @param {readonly T[]} history
 * @returns {{ history: readonly T[], removed: T | null }}
 */
export function popSwipe(history) {
  if (history.length === 0) return { history: EMPTY_HISTORY, removed: null }
  return { history: Object.freeze(history.slice(0, -1)), removed: history[history.length - 1] }
}

/**
 * @template T
 * @param {readonly T[]} history
 * @returns {T | null}
 */
export function peekSwipe(history) {
  return history.length === 0 ? null : history[history.length - 1]
}
