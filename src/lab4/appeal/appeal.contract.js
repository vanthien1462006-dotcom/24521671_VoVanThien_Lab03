/**
 * Contracts of Homework 3, the Fair-Play Appeal Tribunal. All dossier data is invented sample data.
 */

/** @typedef {'false-positive' | 'missing-context' | 'procedural-error'} AppealCategory */

/**
 * One play mode of a dossier: how many matches the player played and how many fair-play flags
 * those matches produced.
 * @typedef {Object} ModeStat
 * @property {string} id        `solo`, `duo` or `squad`.
 * @property {string} label
 * @property {number} matches   Non-negative integer.
 * @property {number} flags     Non-negative integer.
 */

/**
 * An entry of GET /api/dossiers.
 * @typedef {Object} DossierSummary
 * @property {string} playerId   A slug such as `himass`.
 * @property {string} handle
 * @property {string} caseId
 */

/**
 * The receipt of a stored appeal. The statement is never sent back.
 * @typedef {Object} AppealReceipt
 * @property {string} id            crypto.randomUUID(), set by the server.
 * @property {string} playerId
 * @property {string} caseId
 * @property {string} submittedAt   ISO 8601, set by the server.
 */

/**
 * GET /api/dossiers/:playerId. `deadlineAt` and `serverNow` come from the server clock.
 * @typedef {Object} Dossier
 * @property {string} playerId
 * @property {string} handle
 * @property {string} team
 * @property {string} caseId
 * @property {string} summary
 * @property {number} slaHours
 * @property {string} deadlineAt        ISO 8601 UTC: the end of the appeal window.
 * @property {string} serverNow         ISO 8601 UTC: the server clock when it answered.
 * @property {readonly ModeStat[]} modes
 * @property {AppealReceipt | null} appeal
 */

/**
 * The body of POST /api/dossiers/:playerId/appeal. The player and the case come from the URL.
 * @typedef {Object} AppealInput
 * @property {string} contactEmail
 * @property {AppealCategory} category
 * @property {string} statement
 * @property {true} confirmed
 */

/**
 * The raw values of the form while the user types.
 * @typedef {Object} AppealFormValues
 * @property {string} contactEmail
 * @property {string} category        '' until one is chosen.
 * @property {string} statement
 * @property {boolean} confirmed
 */

/** @typedef {Partial<Record<keyof AppealFormValues, string>>} AppealFormErrors */

/**
 * @typedef {{ ok: true, value: AppealInput } | { ok: false, error: string }} AppealValidation
 */

/**
 * An input row of the disproportionality matrix.
 * @typedef {Object} MatrixRow
 * @property {string} id
 * @property {string} label
 * @property {number} exposure   Matches played. Non-negative integer.
 * @property {number} events     Fair-play flags. Non-negative integer.
 */

/** @typedef {'over' | 'under' | 'proportional' | 'insufficient'} MatrixVerdict */

/**
 * @typedef {Object} MatrixCell
 * @property {string} id
 * @property {string} label
 * @property {number} exposure
 * @property {number} events
 * @property {number} exposureShare   0 to 1.
 * @property {number} eventShare      0 to 1.
 * @property {number | null} index    Share of flags divided by share of matches; null when undefined.
 * @property {MatrixVerdict} verdict
 */

/**
 * What the countdown shows. Recomputed from the clock on every tick, never decremented.
 * @typedef {Object} SlaSnapshot
 * @property {number} totalMs     Never negative.
 * @property {number} days
 * @property {number} hours
 * @property {number} minutes
 * @property {number} seconds
 * @property {boolean} expired    True when `totalMs` is 0.
 * @property {number} offsetMs    Estimated server clock minus local clock.
 * @property {boolean} syncing    A re-sync request is in flight.
 * @property {string | null} syncError
 */

export {}
