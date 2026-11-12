import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeRemainingMs, formatCountdown, DROP_PHASES, getDropPhase } from './airdropClock.js'

test('computeRemainingMs subtracts now from target', () => {
  assert.equal(computeRemainingMs(10000, 4000, 0), 6000)
})

test('computeRemainingMs adds a positive server offset to now', () => {
  assert.equal(computeRemainingMs(10000, 4000, 1000), 5000)
})

test('computeRemainingMs adds a negative server offset to now', () => {
  assert.equal(computeRemainingMs(10000, 4000, -1000), 7000)
})

test('computeRemainingMs never goes below zero', () => {
  assert.equal(computeRemainingMs(10000, 12000, 0), 0)
})

test('computeRemainingMs defaults the server offset to 0', () => {
  assert.equal(computeRemainingMs(10000, 4000), 6000)
})

test('formatCountdown(0) is 00:00', () => {
  assert.equal(formatCountdown(0), '00:00')
})

test('formatCountdown rounds seconds up: 999 ms is 00:01', () => {
  assert.equal(formatCountdown(999), '00:01')
})

test('formatCountdown(61000) is 01:01', () => {
  assert.equal(formatCountdown(61000), '01:01')
})

test('formatCountdown(3600000) is 1:00:00', () => {
  assert.equal(formatCountdown(3600000), '1:00:00')
})

test('formatCountdown(3725000) is 1:02:05', () => {
  assert.equal(formatCountdown(3725000), '1:02:05')
})

test('formatCountdown clamps negative input to 00:00', () => {
  assert.equal(formatCountdown(-5000), '00:00')
})

test('DROP_PHASES lists the four phases and is frozen', () => {
  assert.deepEqual(DROP_PHASES, ['WARMUP', 'AIRDROP_LIVE', 'LOOTED_OUT', 'EXPIRED'])
  assert.ok(Object.isFrozen(DROP_PHASES))
})

const phaseRows = [
  { nowMs: 999, remainingStock: 3, expected: 'WARMUP' },
  { nowMs: 1000, remainingStock: 3, expected: 'AIRDROP_LIVE' },
  { nowMs: 1200, remainingStock: 0, expected: 'LOOTED_OUT' },
  { nowMs: 1500, remainingStock: 3, expected: 'EXPIRED' },
  { nowMs: 1500, remainingStock: 0, expected: 'EXPIRED' },
]

for (const { nowMs, remainingStock, expected } of phaseRows) {
  test(`getDropPhase at ${nowMs} with stock ${remainingStock} is ${expected}`, () => {
    assert.equal(getDropPhase({ nowMs, dropEpochMs: 1000, remainingStock, windowMs: 500 }), expected)
  })
}
