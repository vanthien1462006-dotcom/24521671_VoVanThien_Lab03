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
