import { isPlayerId } from './playerId.js'
import { validateSwipeInput } from './validateSwipe.js'

/** @typedef {import('./swipe.contract.js').Profile} Profile */
/** @typedef {import('./swipe.contract.js').SwipeRecord} SwipeRecord */
/** @typedef {import('./swipe.contract.js').SwipeInput} SwipeInput */
/** @typedef {{ signal?: AbortSignal, fetchImpl?: typeof fetch }} RequestOptions */

/** An error from the swipe API (or from client validation) with the HTTP status it maps to. */
export class SwipeApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status) {
    super(message)
    this.name = 'SwipeApiError'
    this.status = status
  }
}

/** @param {Response} response */
async function errorFrom(response) {
  const body = await response.json().catch(() => null)
  const message = typeof body?.error === 'string' ? body.error : `Swipe HTTP ${response.status}`
  return new SwipeApiError(message, response.status)
}

/** @param {unknown} playerId */
function playerQuery(playerId) {
  if (!isPlayerId(playerId)) throw new TypeError('playerId must be a UUID.')
  return `playerId=${encodeURIComponent(playerId)}`
}

/**
 * GET the deck, in order. AbortError is not caught: the caller treats it as a normal outcome.
 * @param {RequestOptions} [options]
 * @returns {Promise<Profile[]>}
 */
export async function fetchProfiles({ signal, fetchImpl = globalThis.fetch } = {}) {
  const response = await fetchImpl('/api/profiles', { signal })
  if (!response.ok) throw await errorFrom(response)
  const payload = await response.json()
  if (!Array.isArray(payload)) throw new Error('Profiles payload is not a list')
  return payload
}

/**
 * GET the swipes this player has already saved, oldest first.
 * @param {string} playerId
 * @param {RequestOptions} [options]
 * @returns {Promise<SwipeRecord[]>}
 */
export async function fetchSwipes(playerId, { signal, fetchImpl = globalThis.fetch } = {}) {
  const response = await fetchImpl(`/api/swipe?${playerQuery(playerId)}`, { signal })
  if (!response.ok) throw await errorFrom(response)
  const payload = await response.json()
  if (!Array.isArray(payload)) throw new Error('Swipes payload is not a list')
  return payload
}

/**
 * POST one swipe. The input is validated first (the server validates again) and only the three
 * known fields are sent.
 * @param {SwipeInput} input
 * @param {RequestOptions} [options]
 * @returns {Promise<SwipeRecord>}
 */
export async function postSwipe(input, { signal, fetchImpl = globalThis.fetch } = {}) {
  const result = validateSwipeInput(input)
  if (!result.ok) throw new SwipeApiError(result.error, 400)
  const response = await fetchImpl('/api/swipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.value),
    signal,
  })
  if (!response.ok) throw await errorFrom(response)
  return response.json()
}

/**
 * Remove the player's newest swipe (the top of the stack) and return it.
 * @param {string} playerId
 * @param {RequestOptions} [options]
 * @returns {Promise<SwipeRecord>}
 */
export async function undoLastSwipe(playerId, { signal, fetchImpl = globalThis.fetch } = {}) {
  const response = await fetchImpl(`/api/swipe/last?${playerQuery(playerId)}`, { method: 'DELETE', signal })
  if (!response.ok) throw await errorFrom(response)
  return response.json()
}

/**
 * Remove every swipe of the player ("Start over").
 * @param {string} playerId
 * @param {RequestOptions} [options]
 * @returns {Promise<void>}
 */
export async function resetSwipes(playerId, { signal, fetchImpl = globalThis.fetch } = {}) {
  const response = await fetchImpl(`/api/swipe?${playerQuery(playerId)}`, { method: 'DELETE', signal })
  if (!response.ok) throw await errorFrom(response)
}
