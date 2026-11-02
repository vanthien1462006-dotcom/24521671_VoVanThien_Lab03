/** @typedef {import('../contracts/pubg-match-telemetry.contract.js').TelemetryView} TelemetryView */
/** @typedef {import('../contracts/pubg-match-telemetry.contract.js').PubgSquad} PubgSquad */

/** @type {TelemetryView} */
export const IDLE_VIEW = Object.freeze({ status: 'IDLE', data: null, error: null })

/**
 * @returns {TelemetryView}
 */
export function loadingView() {
  return Object.freeze({ status: 'LOADING', data: null, error: null })
}

/**
 * @param {PubgSquad} data
 * @returns {TelemetryView}
 */
export function successView(data) {
  return Object.freeze({ status: 'SUCCESS', data, error: null })
}

/**
 * @param {unknown} message
 * @returns {TelemetryView}
 */
export function errorView(message) {
  return Object.freeze({ status: 'ERROR', data: null, error: String(message) })
}
