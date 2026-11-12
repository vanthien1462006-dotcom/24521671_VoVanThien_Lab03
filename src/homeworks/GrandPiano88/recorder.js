/**
 * Records notes in the order they start. The clock is injected so tests can
 * drive time by hand.
 * @param {() => number} [now]  Milliseconds.
 */
export function createTakeRecorder(now = () => performance.now()) {
  let recording = false
  let lastStart = null
  let events = []
  const held = new Map() // midi -> index in events

  function start() {
    events = []
    held.clear()
    recording = true
    lastStart = null
  }

  /**
   * @param {number} midi
   * @param {number} freqHz
   */
  function noteOn(midi, freqHz) {
    if (!recording || held.has(midi)) return
    const t = now()
    const deltaMs = lastStart === null ? 0 : t - lastStart
    lastStart = t
    events.push({ midi, freqHz, startedAt: t, deltaMs, durationMs: null })
    held.set(midi, events.length - 1)
  }

  /**
   * @param {number} midi
   */
  function noteOff(midi) {
    if (!recording || !held.has(midi)) return
    const event = events[held.get(midi)]
    event.durationMs = now() - event.startedAt
    held.delete(midi)
  }

  /**
   * Ends the take. Notes still held end now.
   * @returns {readonly import('./grand-piano.contract.js').RecordedNote[]}
   */
  function stop() {
    const t = now()
    for (const index of held.values()) {
      events[index].durationMs = t - events[index].startedAt
    }
    held.clear()
    recording = false
    return Object.freeze(
      events.map(({ midi, freqHz, durationMs, deltaMs }) =>
        Object.freeze({ midi, freqHz, durationMs, deltaMs }),
      ),
    )
  }

  function isRecording() {
    return recording
  }

  return { start, noteOn, noteOff, stop, isRecording }
}
