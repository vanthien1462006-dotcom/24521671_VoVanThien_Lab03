import { clockOffset } from './slaClock.js'
import { isAppealValid, toAppealInput, validateAppeal } from './validateAppeal.js'

/** @typedef {import('./appeal.contract.js').Dossier} Dossier */
/** @typedef {import('./appeal.contract.js').DossierSummary} DossierSummary */
/** @typedef {import('./appeal.contract.js').AppealReceipt} AppealReceipt */
/** @typedef {import('./appeal.contract.js').AppealFormValues} AppealFormValues */
/** @typedef {{ signal?: AbortSignal, fetchImpl?: typeof fetch }} RequestOptions */

const PLAYER_ID_PATTERN = /^[a-z0-9-]{1,32}$/

/** An error from the dossier API (or from client validation) with the HTTP status it maps to. */
export class DossierApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   */
  constructor(message, status) {
    super(message)
    this.name = 'DossierApiError'
    this.status = status
  }
}

/**
 * A route parameter is untrusted. This is the only shape that may go into a URL.
 * @param {unknown} value
 * @returns {value is string}
 */
export function isDossierId(value) {
  return typeof value === 'string' && PLAYER_ID_PATTERN.test(value)
}

/** @param {unknown} playerId */
function checkedId(playerId) {
  if (!isDossierId(playerId)) throw new TypeError('playerId must be a lower-case slug of 1 to 32 letters, digits or hyphens.')
  return playerId
}

/** @param {Response} response */
async function errorFrom(response) {
  const body = await response.json().catch(() => null)
  const message = typeof body?.error === 'string' ? body.error : `Dossier HTTP ${response.status}`
  return new DossierApiError(message, response.status)
}

/** @param {unknown} value */
const isText = (value) => typeof value === 'string' && value.length > 0
/** @param {unknown} value */
const isCount = (value) => Number.isSafeInteger(value) && /** @type {number} */ (value) >= 0

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isReceipt(value) {
  if (typeof value !== 'object' || value === null) return false
  const receipt = /** @type {Record<string, unknown>} */ (value)
  return isText(receipt.id) && isText(receipt.playerId) && isText(receipt.caseId) && isText(receipt.submittedAt)
}

/**
 * Checks a dossier payload from the server. The deadline is only checked to be text here: the
 * clock store validates it strictly when it is created.
 * @param {unknown} payload
 * @returns {Dossier}
 * @throws {Error} The payload does not have the dossier shape.
 */
function parseDossier(payload) {
  const invalid = () => new Error('Dossier payload is not valid.')
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) throw invalid()
  const d = /** @type {Record<string, unknown>} */ (payload)
  const textsOk = [d.playerId, d.handle, d.team, d.caseId, d.summary, d.deadlineAt].every(isText)
  const slaOk = typeof d.slaHours === 'number' && Number.isFinite(d.slaHours) && d.slaHours > 0
  const serverNowOk = typeof d.serverNow === 'string' && Number.isFinite(Date.parse(d.serverNow))
  const modesOk =
    Array.isArray(d.modes) && d.modes.every((m) => typeof m === 'object' && m !== null && isText(m.id) && isText(m.label) && isCount(m.matches) && isCount(m.flags))
  const appealOk = d.appeal === null || isReceipt(d.appeal)
  if (!(textsOk && slaOk && serverNowOk && modesOk && appealOk)) throw invalid()
  return /** @type {Dossier} */ (payload)
}

/**
 * GET the list of cases. AbortError is not caught: the caller treats it as a normal outcome.
 * @param {RequestOptions} [options]
 * @returns {Promise<DossierSummary[]>}
 */
export async function fetchDossiers({ signal, fetchImpl = globalThis.fetch } = {}) {
  const response = await fetchImpl('/api/dossiers', { signal })
  if (!response.ok) throw await errorFrom(response)
  const payload = await response.json()
  if (!Array.isArray(payload)) throw new Error('Dossier list payload is not a list.')
  return payload
}

/**
 * GET one dossier together with the clock offset measured by that request (the server clock minus
 * the local clock, from the middle of the round trip).
 * @param {string} playerId   An untrusted route parameter: checked before it goes into the URL.
 * @param {RequestOptions & { now?: () => number }} [options]
 * @returns {Promise<{ dossier: Dossier, offsetMs: number }>}
 */
export async function fetchDossier(playerId, { signal, fetchImpl = globalThis.fetch, now = () => Date.now() } = {}) {
  const id = checkedId(playerId)
  const sentAtMs = now()
  const response = await fetchImpl(`/api/dossiers/${id}`, { signal })
  const receivedAtMs = now()
  if (!response.ok) throw await errorFrom(response)
  const dossier = parseDossier(await response.json())
  return { dossier, offsetMs: clockOffset({ sentAtMs, receivedAtMs, serverNowMs: Date.parse(dossier.serverNow) }) }
}

/**
 * GET the server clock, for a re-sync. The caller measures the round trip.
 * @param {RequestOptions} [options]
 * @returns {Promise<{ serverNowMs: number }>}
 */
export async function fetchServerTime({ signal, fetchImpl = globalThis.fetch } = {}) {
  const response = await fetchImpl('/api/time', { signal })
  if (!response.ok) throw await errorFrom(response)
  const payload = await response.json()
  const serverNowMs = typeof payload?.now === 'string' ? Date.parse(payload.now) : Number.NaN
  if (!Number.isFinite(serverNowMs)) throw new Error('Server time payload is not valid.')
  return { serverNowMs }
}

/**
 * POST an appeal. The values are validated first (the server validates again) and only the four
 * known fields are sent.
 * @param {string} playerId
 * @param {AppealFormValues} values
 * @param {RequestOptions} [options]
 * @returns {Promise<AppealReceipt>}
 */
export async function postAppeal(playerId, values, { signal, fetchImpl = globalThis.fetch } = {}) {
  const id = checkedId(playerId)
  const errors = validateAppeal(values)
  if (!isAppealValid(errors)) throw new DossierApiError(Object.values(errors)[0], 400)
  const response = await fetchImpl(`/api/dossiers/${id}/appeal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toAppealInput(values)),
    signal,
  })
  if (!response.ok) throw await errorFrom(response)
  const payload = await response.json()
  if (!isReceipt(payload)) throw new Error('Appeal receipt is not valid.')
  return payload
}
