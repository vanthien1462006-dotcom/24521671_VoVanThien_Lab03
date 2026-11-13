import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findPersonById } from './findPersonById.js'
import { SMART_PEOPLE } from '../../data/smartPeople.js'

test('finds a person by the id taken from the URL', () => {
  assert.equal(findPersonById(SMART_PEOPLE, 'sp-2')?.name, 'Albert Einstein')
})

test('returns null for an id that is not in the list (404 state)', () => {
  assert.equal(findPersonById(SMART_PEOPLE, 'sp-99'), null)
})

test('matches ids exactly: no case folding, no trimming', () => {
  assert.equal(findPersonById(SMART_PEOPLE, 'SP-2'), null)
  assert.equal(findPersonById(SMART_PEOPLE, ' sp-2'), null)
})

test('returns null for a missing or non-string id', () => {
  assert.equal(findPersonById(SMART_PEOPLE, undefined), null)
  assert.equal(findPersonById(SMART_PEOPLE, 2), null)
})

test('returns null when the list is empty', () => {
  assert.equal(findPersonById([], 'sp-2'), null)
})
