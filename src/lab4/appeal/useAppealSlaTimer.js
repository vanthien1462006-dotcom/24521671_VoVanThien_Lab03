import { useState, useSyncExternalStore } from 'react'
import { createSlaClock } from './createSlaClock.js'
import { fetchServerTime } from './dossierApi.js'

/** @typedef {import('./appeal.contract.js').SlaSnapshot} SlaSnapshot */

/**
 * The SLA countdown of one dossier. The clock is an external store read with `useSyncExternalStore`,
 * so the component renders from a snapshot that is computed from the clock and the server offset,
 * never from a counter. There is no effect here: the store attaches its `visibilitychange` and
 * `pageshow` listeners and starts its timer when React subscribes, and removes them and stops when
 * the last subscriber leaves, so StrictMode's subscribe, unsubscribe, subscribe is safe.
 *
 * The clock is created once per mount. Render the component that calls this hook with a `key` that
 * changes with the deadline (for example `key={dossier.deadlineAt}`) so a different case starts a new
 * clock.
 *
 * @param {{ deadlineIso: string, initialOffsetMs: number }} options
 * @returns {Readonly<SlaSnapshot>}
 */
export function useAppealSlaTimer({ deadlineIso, initialOffsetMs }) {
  const [clock] = useState(() => createSlaClock({ deadlineIso, initialOffsetMs, fetchServerTime }))
  return useSyncExternalStore(clock.subscribe, clock.getSnapshot, clock.getSnapshot)
}
