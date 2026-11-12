/**
 * Remaining time derived from a target epoch, so the value cannot drift.
 * @param {number} targetEpochMs
 * @param {number} nowMs
 * @param {number} [serverOffsetMs]
 * @returns {number}
 */
export function computeRemainingMs(targetEpochMs, nowMs, serverOffsetMs = 0) {
  return Math.max(0, targetEpochMs - (nowMs + serverOffsetMs))
}

/**
 * Formats milliseconds as mm:ss, or h:mm:ss from one hour. Seconds round up.
 * @param {number} ms
 * @returns {string}
 */
export function formatCountdown(ms) {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

/** @typedef {import('./pubg-vn-arena.contract.js').DropPhase} DropPhase */

export const DROP_PHASES = Object.freeze(['WARMUP', 'AIRDROP_LIVE', 'LOOTED_OUT', 'EXPIRED'])

/**
 * Phase of a crate drop, derived from the clock and the displayed stock.
 * @param {{ nowMs: number, dropEpochMs: number, remainingStock: number, windowMs: number }} input
 * @returns {DropPhase}
 */
export function getDropPhase({ nowMs, dropEpochMs, remainingStock, windowMs }) {
  if (nowMs < dropEpochMs) return 'WARMUP'
  if (nowMs >= dropEpochMs + windowMs) return 'EXPIRED'
  if (remainingStock <= 0) return 'LOOTED_OUT'
  return 'AIRDROP_LIVE'
}
