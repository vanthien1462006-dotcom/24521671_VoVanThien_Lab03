import { isSwipeAction } from './swipeRules.js'

/** @typedef {import('./swipe.contract.js').SwipeValidation} SwipeValidation */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PROFILE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

/**
 * Validates the body of POST /api/swipe before it is sent. The server runs the same rules
 * (server/src/swipe/validateSwipe.js; a parity test feeds both the same cases). Only the three
 * known fields are copied out. Error messages are fixed text and never repeat the bad value.
 * @param {unknown} input
 * @returns {SwipeValidation}
 */
export function validateSwipeInput(input) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, error: 'Body must be a JSON object with playerId, profileId and action.' }
  }
  const { playerId, profileId, action } = /** @type {Record<string, unknown>} */ (input)
  if (typeof playerId !== 'string' || !UUID_PATTERN.test(playerId)) {
    return { ok: false, error: 'playerId must be a UUID.' }
  }
  if (typeof profileId !== 'string' || !PROFILE_ID_PATTERN.test(profileId)) {
    return { ok: false, error: 'profileId must be 1 to 64 letters, digits, hyphens or underscores.' }
  }
  if (!isSwipeAction(action)) {
    return { ok: false, error: 'action must be LIKE, NOPE or SUPERLIKE.' }
  }
  return { ok: true, value: { playerId, profileId, action } }
}
