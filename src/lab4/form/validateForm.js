/**
 * @typedef {Object} FormValues
 * @property {string} name
 * @property {string} email
 * @property {number} age   From valueAsNumber: NaN when the input is empty.
 */

/** @typedef {Partial<Record<keyof FormValues, string>>} FormErrors */

/** @type {Readonly<FormValues>} */
export const INITIAL_VALUES = Object.freeze({ name: '', email: '', age: Number.NaN })

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function nameError(name) {
  const trimmed = name.trim()
  if (trimmed.length === 0) return 'Name is required.'
  if (trimmed.length < 2 || trimmed.length > 60) return 'Name must be 2 to 60 characters.'
  return undefined
}

function emailError(email) {
  const trimmed = email.trim()
  if (trimmed.length === 0) return 'Email is required.'
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter an email like name@example.com.'
  return undefined
}

function ageError(age) {
  if (typeof age !== 'number' || Number.isNaN(age)) return 'Age is required.'
  if (!Number.isInteger(age)) return 'Age must be a whole number.'
  if (age < 16 || age > 120) return 'Age must be between 16 and 120.'
  return undefined
}

/**
 * Synchronous validation, called during render. Pure: no React, no state, no effects.
 * @param {FormValues} values
 * @returns {FormErrors}   Only invalid fields have a key.
 */
export function validateForm(values) {
  const checks = { name: nameError(values.name), email: emailError(values.email), age: ageError(values.age) }
  return Object.fromEntries(Object.entries(checks).filter(([, message]) => message !== undefined))
}

/**
 * @param {FormErrors} errors
 * @returns {boolean}
 */
export function isFormValid(errors) {
  return Object.keys(errors).length === 0
}
