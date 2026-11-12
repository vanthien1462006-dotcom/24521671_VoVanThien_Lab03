/** @typedef {import('./drum-machine.contract.js').DrumPad} DrumPad */

/** @type {readonly DrumPad[]} */
export const DRUM_PADS = Object.freeze([
  Object.freeze({
    id: 'kick',
    label: 'Kick',
    code: 'KeyW',
    keyLabel: 'W',
    recipe: Object.freeze({ kind: 'tone', wave: 'sine', startHz: 150, endHz: 45, durationMs: 400, gain: 0.9 }),
  }),
  Object.freeze({
    id: 'snare',
    label: 'Snare',
    code: 'KeyA',
    keyLabel: 'A',
    recipe: Object.freeze({ kind: 'noise', filter: 'highpass', filterHz: 1500, durationMs: 200, gain: 0.6 }),
  }),
  Object.freeze({
    id: 'hihat-closed',
    label: 'Closed Hi-Hat',
    code: 'KeyS',
    keyLabel: 'S',
    recipe: Object.freeze({ kind: 'noise', filter: 'highpass', filterHz: 7000, durationMs: 60, gain: 0.35 }),
  }),
  Object.freeze({
    id: 'hihat-open',
    label: 'Open Hi-Hat',
    code: 'KeyD',
    keyLabel: 'D',
    recipe: Object.freeze({ kind: 'noise', filter: 'highpass', filterHz: 7000, durationMs: 350, gain: 0.3 }),
  }),
  Object.freeze({
    id: 'clap',
    label: 'Clap',
    code: 'KeyJ',
    keyLabel: 'J',
    recipe: Object.freeze({ kind: 'noise', filter: 'bandpass', filterHz: 1200, durationMs: 150, gain: 0.6 }),
  }),
  Object.freeze({
    id: 'tom-high',
    label: 'High Tom',
    code: 'KeyK',
    keyLabel: 'K',
    recipe: Object.freeze({ kind: 'tone', wave: 'sine', startHz: 220, endHz: 160, durationMs: 300, gain: 0.7 }),
  }),
  Object.freeze({
    id: 'tom-low',
    label: 'Low Tom',
    code: 'KeyL',
    keyLabel: 'L',
    recipe: Object.freeze({ kind: 'tone', wave: 'sine', startHz: 140, endHz: 90, durationMs: 350, gain: 0.7 }),
  }),
])

/** @type {ReadonlyMap<string, DrumPad>} */
export const PAD_BY_CODE = new Map(DRUM_PADS.map((p) => [p.code, p]))
