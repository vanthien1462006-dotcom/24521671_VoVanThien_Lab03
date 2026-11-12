/**
 * @typedef {'kick' | 'snare' | 'hihat-closed' | 'hihat-open' | 'clap' | 'tom-high' | 'tom-low'} DrumPadId
 */

/**
 * @typedef {Object} ToneRecipe
 * @property {'tone'} kind
 * @property {OscillatorType} wave
 * @property {number} startHz
 * @property {number} endHz
 * @property {number} durationMs
 * @property {number} gain      Peak gain, 0 to 1.
 */

/**
 * @typedef {Object} NoiseRecipe
 * @property {'noise'} kind
 * @property {BiquadFilterType} filter
 * @property {number} filterHz
 * @property {number} durationMs
 * @property {number} gain      Peak gain, 0 to 1.
 */

/**
 * @typedef {ToneRecipe | NoiseRecipe} DrumRecipe
 */

/**
 * @typedef {Object} DrumPad
 * @property {DrumPadId} id
 * @property {string} label     Visible name, for example 'Kick'.
 * @property {string} code      KeyboardEvent.code, for example 'KeyW'.
 * @property {string} keyLabel  Letter shown on the pad and in aria-keyshortcuts, for example 'W'.
 * @property {DrumRecipe} recipe
 */

/**
 * @typedef {Object} DrumHit
 * @property {string} id        crypto.randomUUID()
 * @property {DrumPadId} padId
 * @property {string} label
 * @property {string} keyLabel
 */

/**
 * @typedef {Object} DrumSynth
 * @property {(recipe: DrumRecipe) => void} play   Creates the AudioContext on first use.
 * @property {() => AnalyserNode | null} getAnalyser
 * @property {() => void} close                     Closes the context; a later play creates a new one.
 */

/**
 * @typedef {Object} KeyGuardEvent
 * @property {string} code
 * @property {boolean} repeat
 * @property {boolean} ctrlKey
 * @property {boolean} altKey
 * @property {boolean} metaKey
 * @property {{ tagName?: string, isContentEditable?: boolean } | null} target
 */

export {};
