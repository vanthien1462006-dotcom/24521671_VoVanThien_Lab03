import { test } from 'node:test'
import assert from 'node:assert/strict'
import { INITIAL_VALUES, isFormValid, validateForm } from './validateForm.js'

const VALID = Object.freeze({ name: 'Ada Lovelace', email: 'ada@example.com', age: 36 })

test('valid values give no errors', () => {
  assert.deepEqual(validateForm(VALID), {})
  assert.equal(isFormValid(validateForm(VALID)), true)
})

test('the initial (empty) form has one required error per field', () => {
  const errors = validateForm(INITIAL_VALUES)
  assert.deepEqual(Object.keys(errors).toSorted(), ['age', 'email', 'name'])
  assert.equal(isFormValid(errors), false)
})

test('name: required after trim, 2 to 60 characters', () => {
  assert.equal(validateForm({ ...VALID, name: '   ' }).name, 'Name is required.')
  assert.equal(validateForm({ ...VALID, name: ' A ' }).name, 'Name must be 2 to 60 characters.')
  assert.equal(validateForm({ ...VALID, name: 'x'.repeat(61) }).name, 'Name must be 2 to 60 characters.')
  assert.equal(validateForm({ ...VALID, name: ' Al ' }).name, undefined)
})

test('email: required, shaped like local@domain.tld', () => {
  assert.equal(validateForm({ ...VALID, email: '' }).email, 'Email is required.')
  for (const bad of ['ada', 'ada@', 'ada@example', 'a da@example.com', '@example.com']) {
    assert.equal(validateForm({ ...VALID, email: bad }).email, 'Enter an email like name@example.com.', bad)
  }
  assert.equal(validateForm({ ...VALID, email: '  ada@example.com ' }).email, undefined)
})

test('age: required whole number from 16 to 120 (valueAsNumber gives NaN when empty)', () => {
  assert.equal(validateForm({ ...VALID, age: Number.NaN }).age, 'Age is required.')
  assert.equal(validateForm({ ...VALID, age: '36' }).age, 'Age is required.')
  assert.equal(validateForm({ ...VALID, age: 20.5 }).age, 'Age must be a whole number.')
  assert.equal(validateForm({ ...VALID, age: 15 }).age, 'Age must be between 16 and 120.')
  assert.equal(validateForm({ ...VALID, age: 121 }).age, 'Age must be between 16 and 120.')
  assert.equal(validateForm({ ...VALID, age: 16 }).age, undefined)
  assert.equal(validateForm({ ...VALID, age: 120 }).age, undefined)
})

test('errors are derived, never cached: the same input gives a new equal object', () => {
  const a = validateForm(INITIAL_VALUES)
  const b = validateForm(INITIAL_VALUES)
  assert.notEqual(a, b)
  assert.deepEqual(a, b)
})

test('INITIAL_VALUES is frozen', () => {
  assert.ok(Object.isFrozen(INITIAL_VALUES))
})
