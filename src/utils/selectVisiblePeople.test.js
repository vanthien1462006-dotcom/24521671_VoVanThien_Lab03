import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SMART_PEOPLE } from '../data/smartPeople.js'
import { selectVisiblePeople } from './selectVisiblePeople.js'

const ids = (people) => people.map((p) => p.id)

test('minIq 160, iq-desc keeps a stable order for equal IQ', () => {
  const result = selectVisiblePeople(SMART_PEOPLE, { minIq: 160, sortBy: 'iq-desc' })
  assert.deepEqual(ids(result), ['sp-1', 'sp-2', 'sp-6', 'sp-4', 'sp-5', 'sp-3'])
})

test('minIq 160, age-asc sorts by age ascending', () => {
  const result = selectVisiblePeople(SMART_PEOPLE, { minIq: 160, sortBy: 'age-asc' })
  assert.deepEqual(ids(result), ['sp-6', 'sp-5', 'sp-3', 'sp-2', 'sp-1', 'sp-4'])
})

test('query is case-insensitive', () => {
  assert.deepEqual(ids(selectVisiblePeople(SMART_PEOPLE, { query: 'EIN' })), ['sp-2'])
})

test('query is trimmed', () => {
  assert.deepEqual(ids(selectVisiblePeople(SMART_PEOPLE, { query: '  newton ' })), ['sp-4'])
})

test('minIq 200 keeps only IQ 200 and above', () => {
  assert.deepEqual(ids(selectVisiblePeople(SMART_PEOPLE, { minIq: 200 })), ['sp-1', 'sp-2', 'sp-6'])
})

test('minIq 211 returns an empty list', () => {
  assert.deepEqual(selectVisiblePeople(SMART_PEOPLE, { minIq: 211 }), [])
})

test('an empty query keeps all six people', () => {
  assert.equal(selectVisiblePeople(SMART_PEOPLE, { query: '' }).length, 6)
})

test('does not mutate its input', () => {
  const input = [...SMART_PEOPLE]
  const result = selectVisiblePeople(input, { sortBy: 'age-asc' })
  assert.deepEqual(input, SMART_PEOPLE)
  assert.notEqual(result, input)
})
