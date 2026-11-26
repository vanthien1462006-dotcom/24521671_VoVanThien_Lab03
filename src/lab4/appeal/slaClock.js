const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_DAY = 86_400

/**
 * @param {unknown} value
 * @param {string} name
 * @returns {number}
 */
function finite(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${name} must be a finite number.`)
  return value
}

/**
 * The estimated server clock minus the local clock, from one request. The server read its clock
 * somewhere between the moment the request was sent and the moment the response arrived, so the
 * middle of the round trip is the best guess. The error is at most half the round trip.
 * @param {{ sentAtMs: number, receivedAtMs: number, serverNowMs: number }} timing
 * @returns {number}   Whole milliseconds; positive when the local clock is behind the server.
 * @throws {TypeError} A value is not a finite number.
 * @throws {RangeError} The response arrived before the request was sent (the local clock stepped back).
 */
export function clockOffset({ sentAtMs, receivedAtMs, serverNowMs }) {
  const sent = finite(sentAtMs, 'sentAtMs')
  const received = finite(receivedAtMs, 'receivedAtMs')
  const server = finite(serverNowMs, 'serverNowMs')
  if (received < sent) throw new RangeError('The response arrived before the request was sent.')
  return Math.round(server - (sent + received) / 2) + 0
}

/**
 * What is left until the deadline, recomputed from the two clocks on every call. A partial second
 * counts as a whole one, so 00:00:00 means the deadline has passed. It never goes negative.
 * Bad input throws instead of returning 0: a silent 0 would look like an expired window.
 * @param {number} deadlineMs   The end of the window on the server clock (epoch milliseconds).
 * @param {number} nowMs        The current time on the same clock (local clock plus offset).
 * @returns {{ totalMs: number, days: number, hours: number, minutes: number, seconds: number, expired: boolean }}
 */
export function getSlaRemaining(deadlineMs, nowMs) {
  const diff = finite(deadlineMs, 'deadlineMs') - finite(nowMs, 'nowMs')
  const totalMs = Math.max(0, diff)
  const totalSeconds = Math.ceil(totalMs / MS_PER_SECOND)
  return {
    totalMs,
    days: Math.floor(totalSeconds / SECONDS_PER_DAY),
    hours: Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
    minutes: Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: totalSeconds % SECONDS_PER_MINUTE,
    expired: totalMs === 0,
  }
}

/**
 * How long to wait before the displayed second changes, so the next tick is aimed at the moment of
 * the change instead of "one second from now" (which drifts).
 * @param {number} totalMs   What `getSlaRemaining` returned as `totalMs`.
 * @returns {number}   1 to 1000 while time is left, 0 when nothing is left.
 */
export function msUntilNextSecond(totalMs) {
  const remaining = finite(totalMs, 'totalMs')
  if (remaining <= 0) return 0
  return remaining % MS_PER_SECOND || MS_PER_SECOND
}

/**
 * HH:MM:SS with the days folded into the hours (a 72 hour window reads 72:00:00).
 * @param {{ days: number, hours: number, minutes: number, seconds: number }} remaining
 * @returns {string}
 */
export function formatRemaining({ days, hours, minutes, seconds }) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${pad(days * 24 + hours)}:${pad(minutes)}:${pad(seconds)}`
}
