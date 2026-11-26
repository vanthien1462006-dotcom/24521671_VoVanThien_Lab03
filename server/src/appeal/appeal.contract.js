/**
 * Server contracts of Homework 3, the Fair-Play Appeal Tribunal. All dossier data is invented
 * sample data. The wire shapes match src/lab4/appeal/appeal.contract.js.
 */

/** @typedef {'false-positive' | 'missing-context' | 'procedural-error'} AppealCategory */

/**
 * @typedef {Object} ModeStat
 * @property {string} id
 * @property {string} label
 * @property {number} matches
 * @property {number} flags
 */

/**
 * A dossier as it is stored (frozen sample data).
 * @typedef {Object} DossierRecord
 * @property {string} playerId
 * @property {string} handle
 * @property {string} team
 * @property {string} caseId
 * @property {string} summary
 * @property {number} slaHours
 * @property {readonly ModeStat[]} modes
 */

/**
 * @typedef {Object} DossierSummary
 * @property {string} playerId
 * @property {string} handle
 * @property {string} caseId
 */

/**
 * @typedef {Object} AppealReceipt
 * @property {string} id
 * @property {string} playerId
 * @property {string} caseId
 * @property {string} submittedAt
 */

/**
 * @typedef {DossierRecord & { deadlineAt: string, serverNow: string, appeal: AppealReceipt | null }} Dossier
 */

/**
 * The validated body of POST /api/dossiers/:playerId/appeal. Nothing else from the request is kept.
 * @typedef {Object} AppealInput
 * @property {string} contactEmail
 * @property {AppealCategory} category
 * @property {string} statement
 * @property {true} confirmed
 */

/** @typedef {{ ok: true, value: AppealInput } | { ok: false, error: string }} AppealValidation */

/**
 * `submitAppeal` resolves to a receipt, or to one of the failure markers. The window is checked
 * with the store's own clock.
 * @typedef {{ receipt: AppealReceipt } | { failure: 'not-found' | 'duplicate' | 'closed' }} SubmitResult
 */

/**
 * @typedef {Object} AppealStore
 * @property {() => DossierSummary[]} listDossiers
 * @property {(playerId: string) => Dossier | null} getDossier
 * @property {(playerId: string, input: AppealInput) => SubmitResult} submitAppeal
 * @property {() => string} now   The store clock as an ISO 8601 UTC string.
 */

export {}
