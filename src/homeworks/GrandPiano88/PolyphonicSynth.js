const SILENT_GAIN = 0.0001
const PEAK_GAIN = 0.2
const ATTACK_SECONDS = 0.01
const RELEASE_SECONDS = 0.04
const STOP_SECONDS = 0.05

/**
 * Polyphonic oscillator pool. Voices live in a Map in insertion order, so the
 * oldest voice is always the first key (FIFO voice stealing).
 */
export class PolyphonicSynth {
  /**
   * @param {number} [maxVoices]
   * @param {{ createContext?: () => AudioContext }} [options]  Injected in tests.
   */
  constructor(maxVoices = 8, { createContext = () => new window.AudioContext() } = {}) {
    this.ctx = null
    this.maxVoices = maxVoices
    this.voices = new Map()
    this.createContext = createContext
  }

  /**
   * @param {number} midi
   * @param {number} freqHz
   */
  noteOn(midi, freqHz) {
    if (!this.ctx) this.ctx = this.createContext()
    if (this.ctx.state === 'suspended') this.ctx.resume()
    if (this.voices.has(midi)) return
    if (this.voices.size >= this.maxVoices) {
      const oldestMidi = this.voices.keys().next().value
      this.noteOff(oldestMidi) // FIFO voice stealing
    }
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.frequency.setValueAtTime(freqHz, t)
    gain.gain.setValueAtTime(SILENT_GAIN, t)
    gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, t + ATTACK_SECONDS)
    osc.connect(gain).connect(this.ctx.destination)
    osc.start(t)
    this.voices.set(midi, { osc, gain })
  }

  /**
   * @param {number} midi
   */
  noteOff(midi) {
    const voice = this.voices.get(midi)
    if (!voice || !this.ctx) return
    const t = this.ctx.currentTime
    voice.gain.gain.cancelScheduledValues(t)
    voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, SILENT_GAIN), t)
    voice.gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, t + RELEASE_SECONDS)
    voice.osc.stop(t + STOP_SECONDS)
    this.voices.delete(midi)
  }

  /** Number of voices that currently sound. */
  get activeCount() {
    return this.voices.size
  }

  /** Releases every voice with the click-free envelope. */
  stopAll() {
    for (const midi of [...this.voices.keys()]) this.noteOff(midi)
  }

  /** Stops all voices and closes the context; a later noteOn creates a new one. */
  close() {
    this.stopAll()
    if (this.ctx) this.ctx.close()
    this.ctx = null
  }
}
