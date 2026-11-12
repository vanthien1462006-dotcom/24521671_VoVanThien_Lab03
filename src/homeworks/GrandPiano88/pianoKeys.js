const PITCH_CLASSES = Object.freeze([
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
])

export const FIRST_MIDI = 21
export const LAST_MIDI = 108

/**
 * Equal-tempered frequency in Hz, with midi 69 fixed at 440 Hz. Not rounded.
 * @param {number} midi
 * @returns {number}
 */
export function midiToFrequency(midi) {
  return 440 * 2 ** ((midi - 69) / 12)
}

/**
 * Sharp note name with octave, for example the name of midi 61.
 * @param {number} midi
 * @returns {string}
 */
export function midiToNoteName(midi) {
  return PITCH_CLASSES[midi % 12] + (Math.floor(midi / 12) - 1)
}

/**
 * Builds the 88 keys from FIRST_MIDI to LAST_MIDI.
 * @returns {readonly import('./grand-piano.contract.js').PianoKeyData[]}
 */
export function buildPianoKeys() {
  const keys = []
  for (let midi = FIRST_MIDI; midi <= LAST_MIDI; midi += 1) {
    const noteName = midiToNoteName(midi)
    keys.push(
      Object.freeze({
        midi,
        noteName,
        isBlack: noteName.includes('#'),
        freqHz: midiToFrequency(midi),
      }),
    )
  }
  return Object.freeze(keys)
}

export const PIANO_KEYS = buildPianoKeys()

/**
 * Groups keys into white-key slots. A black key joins the slot of the white
 * key right before it.
 * @param {readonly import('./grand-piano.contract.js').PianoKeyData[]} keys
 * @returns {readonly import('./grand-piano.contract.js').KeySlot[]}
 */
export function groupIntoSlots(keys) {
  const drafts = []
  for (const key of keys) {
    if (!key.isBlack) {
      drafts.push({ white: key, black: null })
    } else if (drafts.length === 0) {
      throw new RangeError('A black key needs a white key before it.')
    } else {
      drafts[drafts.length - 1].black = key
    }
  }
  return Object.freeze(drafts.map((slot) => Object.freeze(slot)))
}

export const KEY_SLOTS = groupIntoSlots(PIANO_KEYS)
