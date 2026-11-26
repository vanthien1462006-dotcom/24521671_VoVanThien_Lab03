import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clockOffset, formatRemaining, getSlaRemaining, msUntilNextSecond } from './slaClock.js'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const NOW = Date.UTC(2026, 10, 26, 10, 0, 0)

test('clockOffset uses the middle of the round trip', () => {
  assert.equal(clockOffset({ sentAtMs: 1000, receivedAtMs: 1200, serverNowMs: 5100 }), 4000)
})

test('clockOffset is negative when the local clock is ahead of the server', () => {
  assert.equal(clockOffset({ sentAtMs: 10_000, receivedAtMs: 10_000, serverNowMs: 6000 }), -4000)
})

test('clockOffset is 0 for a perfect clock and a zero round trip', () => {
  assert.equal(clockOffset({ sentAtMs: 500, receivedAtMs: 500, serverNowMs: 500 }), 0)
})

test('clockOffset returns whole milliseconds', () => {
  const offset = clockOffset({ sentAtMs: 1000, receivedAtMs: 1001, serverNowMs: 1000 })
  assert.ok(Number.isInteger(offset))
})

test('clockOffset rejects numbers that are missing or not finite', () => {
  const good = { sentAtMs: 1, receivedAtMs: 2, serverNowMs: 3 }
  for (const key of Object.keys(good)) {
    for (const bad of [undefined, null, '1', Number.NaN, Infinity]) {
      assert.throws(() => clockOffset({ ...good, [key]: bad }), TypeError, `${key}=${bad}`)
    }
  }
})

test('clockOffset rejects a response that arrived before the request was sent', () => {
  assert.throws(() => clockOffset({ sentAtMs: 2000, receivedAtMs: 1000, serverNowMs: 1500 }), RangeError)
})

test('getSlaRemaining splits the time into days, hours, minutes and seconds', () => {
  const remaining = getSlaRemaining(NOW + DAY + 2 * HOUR + 3 * MINUTE + 4 * SECOND, NOW)
  assert.deepEqual(remaining, { totalMs: DAY + 2 * HOUR + 3 * MINUTE + 4 * SECOND, days: 1, hours: 2, minutes: 3, seconds: 4, expired: false })
})

test('getSlaRemaining handles a 72 hour window', () => {
  const remaining = getSlaRemaining(NOW + 72 * HOUR, NOW)
  assert.equal(remaining.days, 3)
  assert.equal(remaining.hours, 0)
  assert.equal(remaining.expired, false)
})

test('getSlaRemaining is expired at the deadline and never negative after it', () => {
  for (const late of [0, 1, 999, 5 * MINUTE, 400 * DAY]) {
    const remaining = getSlaRemaining(NOW, NOW + late)
    assert.deepEqual(remaining, { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }, `late by ${late}`)
  }
})

test('getSlaRemaining rounds a partial second up, so 00:00:00 means the deadline has passed', () => {
  assert.equal(getSlaRemaining(NOW + 1, NOW).seconds, 1)
  assert.equal(getSlaRemaining(NOW + 999, NOW).seconds, 1)
  assert.equal(getSlaRemaining(NOW + 1000, NOW).seconds, 1)
  assert.equal(getSlaRemaining(NOW + 1001, NOW).seconds, 2)
  assert.equal(getSlaRemaining(NOW + 1, NOW).expired, false)
})

test('getSlaRemaining refuses a deadline or clock that is not a finite number', () => {
  for (const bad of [undefined, null, '1', Number.NaN, Infinity, -Infinity]) {
    assert.throws(() => getSlaRemaining(bad, NOW), TypeError, `deadline ${bad}`)
    assert.throws(() => getSlaRemaining(NOW, bad), TypeError, `now ${bad}`)
  }
})

test('msUntilNextSecond is the time until the displayed second changes', () => {
  assert.equal(msUntilNextSecond(5300), 300)
  assert.equal(msUntilNextSecond(5000), 1000)
  assert.equal(msUntilNextSecond(1), 1)
  assert.equal(msUntilNextSecond(1000), 1000)
  assert.equal(msUntilNextSecond(999), 999)
})

test('msUntilNextSecond is 0 when nothing is left', () => {
  assert.equal(msUntilNextSecond(0), 0)
  assert.equal(msUntilNextSecond(-500), 0)
})

test('msUntilNextSecond is always 1 to 1000, and waiting that long lowers the displayed second by exactly one', () => {
  const total = (ms) => Math.ceil(ms / SECOND)
  for (let remaining = 1; remaining <= 5000; remaining += 1) {
    const wait = msUntilNextSecond(remaining)
    assert.ok(wait >= 1 && wait <= 1000, `remaining ${remaining}: wait ${wait}`)
    assert.equal(total(remaining) - total(remaining - wait), 1, `remaining ${remaining}`)
  }
})

test('msUntilNextSecond refuses a value that is not a finite number', () => {
  for (const bad of [undefined, null, '5', Number.NaN, Infinity]) assert.throws(() => msUntilNextSecond(bad), TypeError)
})

test('formatRemaining pads to HH:MM:SS with all the days folded into hours', () => {
  assert.equal(formatRemaining(getSlaRemaining(NOW + 72 * HOUR, NOW)), '72:00:00')
  assert.equal(formatRemaining(getSlaRemaining(NOW + HOUR + 2 * MINUTE + 3 * SECOND, NOW)), '01:02:03')
  assert.equal(formatRemaining(getSlaRemaining(NOW + 100 * HOUR + 59 * SECOND, NOW)), '100:00:59')
  assert.equal(formatRemaining(getSlaRemaining(NOW + 9 * SECOND, NOW)), '00:00:09')
})

test('formatRemaining shows 00:00:00 when expired and never a minus sign', () => {
  assert.equal(formatRemaining(getSlaRemaining(NOW, NOW + 10 * DAY)), '00:00:00')
})
