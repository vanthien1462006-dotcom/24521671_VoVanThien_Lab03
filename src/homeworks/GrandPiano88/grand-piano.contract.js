/**
 * @typedef {Object} PianoKeyData
 * @property {number} midi       21 to 108.
 * @property {string} noteName   Sharp names, for example 'A0', 'C#4'.
 * @property {boolean} isBlack
 * @property {number} freqHz     440 × 2^((midi − 69) / 12).
 */

/**
 * @typedef {Object} KeySlot
 * @property {PianoKeyData} white
 * @property {PianoKeyData | null} black   The black key that follows the white key, if any.
 */

/**
 * @typedef {Object} RecordedNote
 * @property {number} midi
 * @property {number} freqHz
 * @property {number} durationMs  Time the note was held.
 * @property {number} deltaMs     Time since the previous note started (0 for the first).
 */

/**
 * @typedef {Object} ScheduledNote
 * @property {number} midi
 * @property {number} freqHz
 * @property {number} startMs     From the start of the replay, already divided by the speed.
 * @property {number} durationMs  Already divided by the speed.
 */

/**
 * @typedef {0.5 | 1 | 2} ReplaySpeed
 */

/**
 * @typedef {'idle' | 'recording' | 'playing'} PianoMode
 */

/**
 * @typedef {Object} PianoKeyProps
 * @property {number} midi
 * @property {string} noteName
 * @property {boolean} isBlack
 * @property {boolean} isPressed
 * @property {(midi: number) => void} onNoteOn
 * @property {(midi: number) => void} onNoteOff
 */

export {};
