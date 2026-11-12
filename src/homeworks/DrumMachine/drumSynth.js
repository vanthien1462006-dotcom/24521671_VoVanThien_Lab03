/** @typedef {import('./drum-machine.contract.js').DrumRecipe} DrumRecipe */
/** @typedef {import('./drum-machine.contract.js').DrumSynth} DrumSynth */

const MASTER_GAIN = 0.8
const FFT_SIZE = 2048
const SILENCE = 0.0001
const STOP_TAIL_S = 0.02

/**
 * Creates a Web Audio drum synth. The AudioContext is created lazily on the first play.
 * @param {{ createContext?: () => AudioContext, random?: () => number }} [options]
 * @returns {DrumSynth}
 */
export function createDrumSynth({ createContext = () => new AudioContext(), random = Math.random } = {}) {
  /** @type {AudioContext | null} */
  let ctx = null
  /** @type {GainNode | null} */
  let master = null
  /** @type {AnalyserNode | null} */
  let analyser = null

  function ensure() {
    if (!ctx) {
      ctx = createContext()
      master = ctx.createGain()
      master.gain.value = MASTER_GAIN
      analyser = ctx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      master.connect(analyser)
      analyser.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  }

  /** @param {DrumRecipe} recipe */
  function play(recipe) {
    if (recipe.kind !== 'tone' && recipe.kind !== 'noise') {
      throw new TypeError(`Unknown recipe kind: ${recipe.kind}`)
    }
    ensure()
    const t = ctx.currentTime
    const dur = recipe.durationMs / 1000
    const g = ctx.createGain()
    g.gain.setValueAtTime(recipe.gain, t)
    g.gain.exponentialRampToValueAtTime(SILENCE, t + dur)

    if (recipe.kind === 'tone') {
      const osc = ctx.createOscillator()
      osc.type = recipe.wave
      osc.frequency.setValueAtTime(recipe.startHz, t)
      osc.frequency.exponentialRampToValueAtTime(recipe.endHz, t + dur)
      osc.connect(g).connect(master)
      osc.start(t)
      osc.stop(t + dur + STOP_TAIL_S)
      return
    }

    const length = Math.round(ctx.sampleRate * dur)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i += 1) {
      data[i] = random() * 2 - 1
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = recipe.filter
    filter.frequency.setValueAtTime(recipe.filterHz, t)
    src.connect(filter).connect(g).connect(master)
    src.start(t)
    src.stop(t + dur + STOP_TAIL_S)
  }

  function getAnalyser() {
    return analyser
  }

  function close() {
    if (ctx) {
      ctx.close()
    }
    ctx = null
    master = null
    analyser = null
  }

  return { play, getAnalyser, close }
}
