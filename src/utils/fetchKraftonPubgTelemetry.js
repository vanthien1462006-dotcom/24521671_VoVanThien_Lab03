import { PUBG_VN_SQUADS } from '../data/pubgVnSquads.js'

/** @typedef {import('../contracts/pubg-match-telemetry.contract.js').PubgSquad} PubgSquad */
/** @typedef {import('../contracts/pubg-match-telemetry.contract.js').FetchTelemetryOptions} FetchTelemetryOptions */

export const PACKET_LOSS_RATE = 0.35

/**
 * @param {unknown} id
 * @returns {boolean}  True only for a string id listed in PUBG_VN_SQUADS.
 */
export function isKnownSquadId(id) {
  return typeof id === 'string' && PUBG_VN_SQUADS.some((s) => s.id === id)
}

/**
 * Fetches the static telemetry payload of one squad, with simulated packet loss.
 * An AbortError from fetchImpl is not caught: the caller decides what to do with it.
 * @param {string} squadId
 * @param {FetchTelemetryOptions} [options]
 * @returns {Promise<PubgSquad>}
 */
export async function fetchKraftonPubgTelemetry(
  squadId,
  { signal, fetchImpl = globalThis.fetch, random = Math.random } = {},
) {
  if (!isKnownSquadId(squadId)) {
    throw new Error(`Unknown squad: ${squadId}`)
  }
  const response = await fetchImpl(`/telemetry/${squadId}.json`, { signal })
  if (!response.ok) {
    throw new Error(`Telemetry HTTP ${response.status}`)
  }
  const payload = await response.json()
  if (random() < PACKET_LOSS_RATE) {
    throw new Error('Satellite packet lost (35% loss simulation)')
  }
  if (payload?.id !== squadId) {
    throw new Error('Telemetry payload does not match the squad')
  }
  return payload
}
