export const REPLAY_SPEEDS = Object.freeze([0.5, 1, 2])

/**
 * Pure schedule: start times are the running sum of deltaMs, then divided by
 * the speed together with the durations.
 * @param {readonly import('./grand-piano.contract.js').RecordedNote[]} events
 * @param {import('./grand-piano.contract.js').ReplaySpeed} speed
 * @returns {readonly import('./grand-piano.contract.js').ScheduledNote[]}
 */
export function buildReplaySchedule(events, speed) {
  if (!REPLAY_SPEEDS.includes(speed)) {
    throw new RangeError(`Unsupported replay speed: ${speed}`)
  }
  let cumulativeMs = 0
  const schedule = events.map(({ midi, freqHz, durationMs, deltaMs }) => {
    cumulativeMs += deltaMs
    return Object.freeze({
      midi,
      freqHz,
      startMs: cumulativeMs / speed,
      durationMs: durationMs / speed,
    })
  })
  return Object.freeze(schedule)
}

/**
 * Resolves after ms. Rejects with an AbortError when the signal aborts.
 * @param {number} ms
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>}
 */
export function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    function onAbort() {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Plays a schedule in time order. At the same time, note-offs come before
 * note-ons and equal items keep their schedule order. An AbortError is not
 * caught here: the caller decides what it means.
 * @param {readonly import('./grand-piano.contract.js').ScheduledNote[]} schedule
 * @param {{
 *   onNoteOn: (midi: number, freqHz: number) => void,
 *   onNoteOff: (midi: number) => void,
 *   signal?: AbortSignal,
 *   delay?: (ms: number, signal?: AbortSignal) => Promise<void>,
 * }} options
 * @returns {Promise<void>}
 */
export async function playSequence(
  schedule,
  { onNoteOn, onNoteOff, signal, delay: wait = delay },
) {
  const timeline = schedule
    .flatMap(({ midi, freqHz, startMs, durationMs }) => [
      { type: 'on', atMs: startMs, midi, freqHz },
      { type: 'off', atMs: startMs + durationMs, midi, freqHz },
    ])
    .toSorted((a, b) => a.atMs - b.atMs || compareType(a.type, b.type))

  let elapsedMs = 0
  for (const item of timeline) {
    await wait(item.atMs - elapsedMs, signal)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    elapsedMs = item.atMs
    if (item.type === 'on') onNoteOn(item.midi, item.freqHz)
    else onNoteOff(item.midi)
  }
}

/** Off before on; equal types compare equal so the stable order is kept. */
function compareType(a, b) {
  if (a === b) return 0
  return a === 'off' ? -1 : 1
}
