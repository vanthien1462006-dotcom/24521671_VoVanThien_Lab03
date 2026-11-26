/** @typedef {import('./appeal.contract.js').AppealFormValues} AppealFormValues */
/** @typedef {import('./appeal.contract.js').AppealFormErrors} AppealFormErrors */
/** @typedef {import('./appeal.contract.js').AppealInput} AppealInput */

export const STATEMENT_MIN = 50
export const STATEMENT_MAX = 1000
export const EMAIL_MAX = 254

/** Stable option values for the category `select`; the labels are for people. */
export const APPEAL_CATEGORIES = Object.freeze([
  Object.freeze({ value: 'false-positive', label: 'The flag is a false positive' }),
  Object.freeze({ value: 'missing-context', label: 'Context is missing from the review' }),
  Object.freeze({ value: 'procedural-error', label: 'The review had a procedural error' }),
])

/** @type {Readonly<AppealFormValues>} */
export const INITIAL_APPEAL_VALUES = Object.freeze({ contactEmail: '', category: '', statement: '', confirmed: false })

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CATEGORY_VALUES = new Set(APPEAL_CATEGORIES.map((category) => category.value))

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
  return typeof value === 'string' && CATEGORY_VALUES.has(value) ? undefined : 'Choose a reason for the appeal.'
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
 * Synchronous validation, called during render. Pure: no React, no state, no effects. The server
 * applies the same rules (server/src/appeal/validateAppeal.js; a parity test feeds both the same
 * cases). Messages are fixed text and never repeat what the user typed.
 * @param {AppealFormValues} values
 * @returns {AppealFormErrors}   Only invalid fields have a key.
 */
export function validateAppeal(values) {
  const checks = {
    contactEmail: emailError(values.contactEmail),
    category: categoryError(values.category),
    statement: statementError(values.statement),
    confirmed: confirmedError(values.confirmed),
  }
  return Object.fromEntries(Object.entries(checks).filter(([, message]) => message !== undefined))
}

/**
 * @param {AppealFormErrors} errors
 * @returns {boolean}
 */
export function isAppealValid(errors) {
  return Object.keys(errors).length === 0
}

/**
 * The request body for a form that passed validation: the four known fields, text trimmed.
 * @param {AppealFormValues} values
 * @returns {AppealInput}
 * @throws {TypeError} The values are not valid.
 */
export function toAppealInput(values) {
  if (!isAppealValid(validateAppeal(values))) throw new TypeError('The appeal values are not valid.')
  return {
    contactEmail: values.contactEmail.trim(),
    category: /** @type {AppealInput['category']} */ (values.category),
    statement: values.statement.trim(),
    confirmed: true,
  }
}
