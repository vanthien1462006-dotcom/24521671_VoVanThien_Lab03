/** @typedef {import('./appeal.contract.js').AppealValidation} AppealValidation */

const STATEMENT_MIN = 50
const STATEMENT_MAX = 1000
const EMAIL_MAX = 254
const CATEGORIES = new Set(['false-positive', 'missing-context', 'procedural-error'])
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DOSSIER_ID_PATTERN = /^[a-z0-9-]{1,32}$/

/**
 * A route parameter is untrusted. This is the only shape that is looked up.
 * @param {unknown} value
 * @returns {value is string}
 */
export function isDossierId(value) {
  return typeof value === 'string' && DOSSIER_ID_PATTERN.test(value)
}

/** @param {unknown} value */
function emailError(value) {
  const email = typeof value === 'string' ? value.trim() : ''
  if (email.length === 0) return 'Email is required.'
  if (email.length > EMAIL_MAX) return `Email must be at most ${EMAIL_MAX} characters.`
  if (!EMAIL_PATTERN.test(email)) return 'Enter an email like name@example.com.'
  return undefined
}

/** @param {unknown} value */
function categoryError(value) {
  return typeof value === 'string' && CATEGORIES.has(value) ? undefined : 'Choose a reason for the appeal.'
}

/** @param {unknown} value */
function statementError(value) {
  const statement = typeof value === 'string' ? value.trim() : ''
  if (statement.length === 0) return 'Statement is required.'
  if (statement.length < STATEMENT_MIN) return `Statement must be at least ${STATEMENT_MIN} characters.`
  if (statement.length > STATEMENT_MAX) return `Statement must be at most ${STATEMENT_MAX} characters.`
  return undefined
}

/** @param {unknown} value */
function confirmedError(value) {
  return value === true ? undefined : 'Confirm that the statement is accurate.'
}

/**
 * Validates the body of POST /api/dossiers/:playerId/appeal. Only the four known fields are copied
 * out, so a client cannot forge an id, a date or the player. The rules and the messages match
 * src/lab4/appeal/validateAppeal.js; a parity test feeds both the same cases. The first problem, in
 * the order of the form, is reported with fixed text that never repeats what was sent.
 * @param {unknown} body
 * @returns {AppealValidation}
 */
export function validateAppeal(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object with contactEmail, category, statement and confirmed.' }
  }
  const { contactEmail, category, statement, confirmed } = /** @type {Record<string, unknown>} */ (body)
  const error = emailError(contactEmail) ?? categoryError(category) ?? statementError(statement) ?? confirmedError(confirmed)
  if (error !== undefined) return { ok: false, error }
  return {
    ok: true,
    value: {
      contactEmail: /** @type {string} */ (contactEmail).trim(),
      category: /** @type {import('./appeal.contract.js').AppealCategory} */ (category),
      statement: /** @type {string} */ (statement).trim(),
      confirmed: true,
    },
  }
}
