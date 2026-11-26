import { clockOffset, getSlaRemaining, msUntilNextSecond } from './slaClock.js'

/** @typedef {import('./appeal.contract.js').SlaSnapshot} SlaSnapshot */

const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/
const ISO_SECONDS_LENGTH = 19
const SYNC_ERROR = 'Could not re-sync with the server clock.'

/**
 * Epoch milliseconds of an existing UTC instant in ISO 8601 form ending with "Z", or NaN. The
 * round trip rejects a date such as 2026-02-30 that the parser would silently roll over.
 * @param {unknown} value
 * @returns {number}
 */
function parseUtcIso(value) {
  if (typeof value !== 'string' || !ISO_UTC_PATTERN.test(value)) return Number.NaN
  const ms = Date.parse(value)
  if (Number.isNaN(ms)) return Number.NaN
  return new Date(ms).toISOString().slice(0, ISO_SECONDS_LENGTH) === value.slice(0, ISO_SECONDS_LENGTH) ? ms : Number.NaN
}

/**
 * The zero-drift SLA clock, as an external store for `useSyncExternalStore`.
 *
 * Every snapshot is computed from `now() + offset`, never from a counter that is decremented, so a
 * late timer, a throttled tab or a frozen page loses no time. The next tick is aimed at the moment
 * the displayed second changes. The offset is the estimated difference between the server clock
 * and the local clock, so a wrong local clock does not change the countdown.
 *
 * The store works while it has subscribers. The first one attaches the `visibilitychange` and
 * `pageshow` listeners and starts the timer; the last one removes them and stops it (React
 * StrictMode subscribes, unsubscribes and subscribes again). While the page is hidden nothing is
 * scheduled; when it is visible again the value is recomputed from the clock and the offset is
 * re-synced with the server. A response for a request that was replaced, cancelled or disposed is
 * ignored. A failed re-sync keeps the previous offset.
 *
 * @param {{
 *   deadlineIso: string,
 *   initialOffsetMs?: number,
 *   fetchServerTime?: (options: { signal: AbortSignal }) => Promise<{ serverNowMs: number }>,
 *   now?: () => number,
 *   visibilityTarget?: (EventTarget & { visibilityState: string }) | null,
 *   pageTarget?: EventTarget | null,
 * }} options
 * @returns {{
 *   subscribe: (listener: () => void) => () => void,
 *   getSnapshot: () => Readonly<SlaSnapshot>,
 *   resync: () => Promise<void>,
 *   dispose: () => void,
 * }}
 */
export function createSlaClock({
  deadlineIso,
  initialOffsetMs = 0,
  fetchServerTime,
  now = () => Date.now(),
  visibilityTarget = globalThis.document,
  pageTarget = globalThis.window,
}) {
  const deadlineMs = parseUtcIso(deadlineIso)
  if (Number.isNaN(deadlineMs)) {
    throw new Error('Invalid deadline: it must be an existing UTC instant in ISO 8601 form ending with "Z".')
  }
  if (typeof initialOffsetMs !== 'number' || !Number.isFinite(initialOffsetMs)) {
    throw new TypeError('initialOffsetMs must be a finite number.')
  }

  let offsetMs = initialOffsetMs
  let syncing = false
  let syncError = /** @type {string | null} */ (null)
  let running = false
  let disposed = false
  let timerId = /** @type {ReturnType<typeof setTimeout> | null} */ (null)
  let generation = 0
  let controller = /** @type {AbortController | null} */ (null)
  const subscribers = new Set()

  function build() {
    return Object.freeze({ ...getSlaRemaining(deadlineMs, now() + offsetMs), offsetMs, syncing, syncError })
  }

  let snapshot = build()

  function clearTimer() {
    if (timerId !== null) globalThis.clearTimeout(timerId)
    timerId = null
  }

  function schedule() {
    clearTimer()
    if (!running || snapshot.expired) return
    timerId = globalThis.setTimeout(tick, msUntilNextSecond(snapshot.totalMs))
  }

  /** Recompute from the clock, tell the listeners, and aim the next tick. */
  function tick() {
    timerId = null
    snapshot = build()
    for (const entry of [...subscribers]) entry.listener()
    schedule()
  }

  /** Forget the request in flight. Quiet: used when the page is hidden or the store stops. */
  function cancelSync() {
    generation += 1
    controller?.abort()
    controller = null
    syncing = false
    snapshot = build()
  }

  async function resync() {
    if (disposed || typeof fetchServerTime !== 'function') return
    generation += 1
    const mine = generation
    controller?.abort()
    const own = new AbortController()
    controller = own
    syncing = true
    syncError = null
    snapshot = build()
    for (const entry of [...subscribers]) entry.listener()

    try {
      const sentAtMs = now()
      const answer = await fetchServerTime({ signal: own.signal })
      const receivedAtMs = now()
      if (mine !== generation || own.signal.aborted) return
      offsetMs = clockOffset({ sentAtMs, receivedAtMs, serverNowMs: /** @type {number} */ (answer?.serverNowMs) })
      syncing = false
      tick()
    } catch (err) {
      if (mine !== generation) return
      syncing = false
      if (/** @type {{ name?: string }} */ (err)?.name !== 'AbortError') syncError = SYNC_ERROR
      tick()
    }
  }

  function handleVisibilityChange() {
    if (visibilityTarget?.visibilityState === 'visible') {
      tick()
      void resync()
    } else {
      clearTimer()
      cancelSync()
    }
  }

  /** @param {Event} event */
  function handlePageShow(event) {
    if (/** @type {PageTransitionEvent} */ (event).persisted) {
      tick()
      void resync()
    }
  }

  function start() {
    running = true
    snapshot = build()
    visibilityTarget?.addEventListener('visibilitychange', handleVisibilityChange)
    pageTarget?.addEventListener('pageshow', handlePageShow)
    schedule()
  }

  function stop() {
    running = false
    clearTimer()
    cancelSync()
    visibilityTarget?.removeEventListener('visibilitychange', handleVisibilityChange)
    pageTarget?.removeEventListener('pageshow', handlePageShow)
  }

  return {
    subscribe(listener) {
      if (disposed) return () => {}
      const entry = { listener }
      subscribers.add(entry)
      if (!running) start()
      return () => {
        if (!subscribers.delete(entry)) return
        if (subscribers.size === 0) stop()
      }
    },
    getSnapshot: () => snapshot,
    resync,
    dispose() {
      if (disposed) return
      disposed = true
      subscribers.clear()
      stop()
    },
  }
}
