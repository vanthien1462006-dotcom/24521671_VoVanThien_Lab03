/** @typedef {import('./swipe.contract.js').SwipeValidation} SwipeValidation */

const ACTIONS = Object.freeze(['LIKE', 'NOPE', 'SUPERLIKE'])
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PROFILE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

/**
 * Validates the body of POST /api/swipe. Only `playerId`, `profileId` and `action` are copied
 * out, so a client cannot forge `_id`, `createdAt` or any other stored property. The rules and the
 * messages match src/lab4/swipe/validateSwipe.js; a parity test feeds both the same cases.
 * @param {unknown} body
 * @returns {SwipeValidation}
 */
export function validateSwipe(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object with playerId, profileId and action.' }
  }
  const { playerId, profileId, action } = /** @type {Record<string, unknown>} */ (body)
  if (typeof playerId !== 'string' || !UUID_PATTERN.test(playerId)) {
    return { ok: false, error: 'playerId must be a UUID.' }
  }
  if (typeof profileId !== 'string' || !PROFILE_ID_PATTERN.test(profileId)) {
    return { ok: false, error: 'profileId must be 1 to 64 letters, digits, hyphens or underscores.' }
  }
  if (typeof action !== 'string' || !ACTIONS.includes(action)) {
    return { ok: false, error: 'action must be LIKE, NOPE or SUPERLIKE.' }
  }
  return { ok: true, value: { playerId, profileId, action: /** @type {import('./swipe.contract.js').SwipeAction} */ (action) } }
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isPlayerId(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}
