import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  APPEAL_CATEGORIES,
  EMAIL_MAX,
  INITIAL_APPEAL_VALUES,
  STATEMENT_MAX,
  STATEMENT_MIN,
  isAppealValid,
  toAppealInput,
  validateAppeal,
} from './validateAppeal.js'

const statement = 'x'.repeat(STATEMENT_MIN)
const good = Object.freeze({ contactEmail: 'player@example.com', category: 'false-positive', statement, confirmed: true })

test('the limits are the documented ones', () => {
  assert.equal(STATEMENT_MIN, 50)
  assert.equal(STATEMENT_MAX, 1000)
  assert.equal(EMAIL_MAX, 254)
})

test('the three categories have stable values and visible labels', () => {
  assert.deepEqual(APPEAL_CATEGORIES.map((c) => c.value), ['false-positive', 'missing-context', 'procedural-error'])
  for (const category of APPEAL_CATEGORIES) assert.ok(category.label.trim().length > 0)
  assert.ok(Object.isFrozen(APPEAL_CATEGORIES))
})

test('the initial values are frozen, empty and unchecked', () => {
  assert.ok(Object.isFrozen(INITIAL_APPEAL_VALUES))
  assert.deepEqual({ ...INITIAL_APPEAL_VALUES }, { contactEmail: '', category: '', statement: '', confirmed: false })
})

test('a valid form has no errors', () => {
  assert.deepEqual(validateAppeal(good), {})
  assert.equal(isAppealValid(validateAppeal(good)), true)
})

test('the empty form has one error per field, and only invalid fields have a key', () => {
  const errors = validateAppeal(INITIAL_APPEAL_VALUES)
  assert.deepEqual(Object.keys(errors).toSorted(), ['category', 'confirmed', 'contactEmail', 'statement'])
  assert.equal(isAppealValid(errors), false)
  assert.deepEqual(Object.keys(validateAppeal({ ...good, contactEmail: '' })), ['contactEmail'])
})

test('email: required, shaped like an address, at most 254 characters, and spaces are trimmed', () => {
  assert.match(validateAppeal({ ...good, contactEmail: '' }).contactEmail, /required/i)
  assert.match(validateAppeal({ ...good, contactEmail: '   ' }).contactEmail, /required/i)
  for (const bad of ['plain', 'a@b', '@b.com', 'a@.com', 'a b@c.com', 'a@b@c.com']) {
    assert.match(validateAppeal({ ...good, contactEmail: bad }).contactEmail, /name@example\.com/, bad)
  }
  assert.equal(validateAppeal({ ...good, contactEmail: '  player@example.com  ' }).contactEmail, undefined)
  const long = `${'a'.repeat(EMAIL_MAX - 12)}@example.com`
  assert.equal(long.length, EMAIL_MAX)
  assert.equal(validateAppeal({ ...good, contactEmail: long }).contactEmail, undefined)
  assert.match(validateAppeal({ ...good, contactEmail: `a${long}` }).contactEmail, /254/)
})

test('category: must be one of the three stable values', () => {
  assert.match(validateAppeal({ ...good, category: '' }).category, /choose/i)
  for (const bad of ['False-Positive', 'other', 'constructor', '__proto__', ' false-positive', 7, null, undefined]) {
    assert.ok(validateAppeal({ ...good, category: bad }).category, String(bad))
  }
  for (const { value } of APPEAL_CATEGORIES) assert.equal(validateAppeal({ ...good, category: value }).category, undefined, value)
})

test('statement: required, 50 to 1000 characters after trimming', () => {
  assert.match(validateAppeal({ ...good, statement: '' }).statement, /required/i)
  assert.match(validateAppeal({ ...good, statement: ' '.repeat(80) }).statement, /required/i)
  assert.match(validateAppeal({ ...good, statement: 'x'.repeat(STATEMENT_MIN - 1) }).statement, /at least 50/i)
  assert.equal(validateAppeal({ ...good, statement: 'x'.repeat(STATEMENT_MIN) }).statement, undefined)
  assert.equal(validateAppeal({ ...good, statement: 'x'.repeat(STATEMENT_MAX) }).statement, undefined)
  assert.match(validateAppeal({ ...good, statement: 'x'.repeat(STATEMENT_MAX + 1) }).statement, /at most 1000/i)
})

test('statement: spaces around the text do not count towards the minimum or the maximum', () => {
  assert.ok(validateAppeal({ ...good, statement: `   ${'x'.repeat(STATEMENT_MIN - 1)}   ` }).statement)
  assert.equal(validateAppeal({ ...good, statement: ` ${'x'.repeat(STATEMENT_MAX)} ` }).statement, undefined)
})

test('confirmed: only the boolean true passes', () => {
  assert.match(validateAppeal({ ...good, confirmed: false }).confirmed, /confirm/i)
  for (const bad of ['true', 1, 'on', null, undefined]) assert.ok(validateAppeal({ ...good, confirmed: bad }).confirmed, String(bad))
})

test('values that are not strings give an error instead of throwing', () => {
  assert.doesNotThrow(() => validateAppeal({ contactEmail: 5, category: {}, statement: null, confirmed: 'yes' }))
  const errors = validateAppeal({ contactEmail: 5, category: {}, statement: null, confirmed: 'yes' })
  assert.equal(isAppealValid(errors), false)
})

test('validation is pure: it does not change its input and gives the same answer twice', () => {
  const input = Object.freeze({ ...good, statement: 'short' })
  const first = validateAppeal(input)
  assert.deepEqual(validateAppeal(input), first)
  assert.equal(input.statement, 'short')
})

test('error messages never repeat what the user typed', () => {
  const secret = 'hunter2-not-an-email'
  const errors = validateAppeal({ ...good, contactEmail: secret })
  assert.ok(!errors.contactEmail.includes(secret))
})

test('toAppealInput keeps only the four fields and trims the text', () => {
  const input = toAppealInput({ ...good, contactEmail: '  player@example.com ', statement: `  ${statement}  `, extra: 'dropped' })
  assert.deepEqual(input, { contactEmail: 'player@example.com', category: 'false-positive', statement, confirmed: true })
})

test('toAppealInput refuses values that did not pass validation', () => {
  assert.throws(() => toAppealInput({ ...good, category: '' }), TypeError)
  assert.throws(() => toAppealInput({ ...good, confirmed: false }), TypeError)
})
