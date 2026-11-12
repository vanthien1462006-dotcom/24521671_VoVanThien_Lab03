import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatVnd } from './formatVnd.js'

/** Intl puts a no-break space (U+00A0) before the currency sign; normalize it for comparison. */
function plain(text) {
  return text.replace(/ /g, ' ')
}

test('formatVnd(1990000) is 1.990.000 ₫', () => {
  assert.equal(plain(formatVnd(1990000)), '1.990.000 ₫')
})

test('formatVnd(149000) is 149.000 ₫', () => {
  assert.equal(plain(formatVnd(149000)), '149.000 ₫')
})

test('formatVnd(0) is 0 ₫', () => {
  assert.equal(plain(formatVnd(0)), '0 ₫')
})
