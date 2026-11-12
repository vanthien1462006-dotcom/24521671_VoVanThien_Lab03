import { FIRST_MIDI, LAST_MIDI } from './pianoKeys.js'

/** Physical key (KeyboardEvent.code) to semitone offset from the octave's first note. */
export const SEMITONE_BY_CODE = new Map([
  ['KeyA', 0],
  ['KeyW', 1],
  ['KeyS', 2],
  ['KeyE', 3],
  ['KeyD', 4],
  ['KeyF', 5],
  ['KeyT', 6],
  ['KeyG', 7],
  ['KeyY', 8],
  ['KeyH', 9],
  ['KeyU', 10],
  ['KeyJ', 11],
  ['KeyK', 12],
])

export const OCTAVES = Object.freeze([1, 2, 3, 4, 5, 6, 7])
export const DEFAULT_OCTAVE = 4

/**
 * @param {string} code    KeyboardEvent.code, for example the code of the A key.
 * @param {number} octave  Scientific pitch octave; the first note of octave n is midi (n + 1) * 12.
 * @returns {number | null}  Midi number, or null when unmapped or outside the piano range.
 */
export function computerKeyToMidi(code, octave) {
  const semitone = SEMITONE_BY_CODE.get(code)
  if (semitone === undefined) return null
  const midi = (octave + 1) * 12 + semitone
  if (midi < FIRST_MIDI || midi > LAST_MIDI) return null
  return midi
}
