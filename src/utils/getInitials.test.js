import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getInitials } from './getInitials.js'

test('returns first and last initials of a full name', () => {
  assert.equal(getInitials('Võ Văn Thiện'), 'VT')
})

test('trims and collapses extra whitespace', () => {
  assert.equal(getInitials('  tran   vinh khiem  '), 'TK')
})

test('returns one letter for a single word', () => {
  assert.equal(getInitials('Madonna'), 'M')
})

test('uppercases Vietnamese letters with diacritics', () => {
  assert.equal(getInitials('đặng văn lâm'), 'ĐL')
})

test('returns ? for an empty or blank string', () => {
  assert.equal(getInitials(''), '?')
  assert.equal(getInitials('   '), '?')
})

test('returns ? for a non-string input', () => {
  assert.equal(getInitials(null), '?')
  assert.equal(getInitials(undefined), '?')
  assert.equal(getInitials(42), '?')
})
