/**
 * @typedef {Object} PubgSquad
 * @property {string} id        Stable id: 'ces', 'te' or 'ge'. React key and payload file name.
 * @property {string} name
 * @property {string} map
 * @property {string} phase
 * @property {number} alive
 * @property {number} kills
 * @property {string} wwcdProb  Display string from the slide, for example '68%'.
 * @property {string} status
 */

/**
 * @typedef {'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'} TelemetryStatus
 */

/**
 * @typedef {Object} TelemetryView
 * @property {TelemetryStatus} status
 * @property {PubgSquad | null} data  Not null only when status is 'SUCCESS'.
 * @property {string | null} error    Not null only when status is 'ERROR'.
 */

/**
 * @typedef {Object} FetchTelemetryOptions
 * @property {AbortSignal} [signal]
 * @property {typeof fetch} [fetchImpl]  Defaults to the global fetch. Injected in tests.
 * @property {() => number} [random]     Defaults to Math.random. Injected in tests.
 */

/**
 * @typedef {Object} PubgMatchTelemetryProps
 * @property {string} [initialSquadId]  Defaults to 'te'. An unknown id falls back to 'te'.
 */

export {};
