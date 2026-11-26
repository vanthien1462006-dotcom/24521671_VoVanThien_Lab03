import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateAppeal as validateOnClient } from '../../../src/lab4/appeal/validateAppeal.js'
import { isDossierId, validateAppeal } from './validateAppeal.js'

const statement = 'x'.repeat(60)
const good = { contactEmail: 'player@example.com', category: 'false-positive', statement, confirmed: true }

test('a valid body passes and returns exactly the four fields, text trimmed', () => {
  const result = validateAppeal({ ...good, contactEmail: '  player@example.com ', statement: `  ${statement}  ` })
  assert.equal(result.ok, true)
  assert.deepEqual(result.value, good)
})

test('extra fields are dropped, so a client cannot forge an id, a date or any other property', () => {
  const result = validateAppeal({ ...good, id: 'x', _id: 'y', submittedAt: '2000-01-01', playerId: 'tanvuu', isAdmin: true })
  assert.equal(result.ok, true)
  assert.deepEqual(Object.keys(result.value).toSorted(), ['category', 'confirmed', 'contactEmail', 'statement'])
})

test('a body parsed from JSON with an own __proto__ key does not change the result', () => {
  const body = JSON.parse(`{"contactEmail":"player@example.com","category":"false-positive","statement":"${statement}","confirmed":true,"__proto__":{"category":"other"}}`)
  const result = validateAppeal(body)
  assert.equal(result.ok, true)
  assert.equal(result.value.category, 'false-positive')
  assert.equal(Object.getPrototypeOf(result.value), Object.prototype)
})

test('a body that is not an object is rejected', () => {
  for (const body of [null, undefined, [], 'appeal', 5, true]) {
    const result = validateAppeal(body)
    assert.equal(result.ok, false, String(body))
    assert.match(result.error, /JSON object/)
  }
})

test('the first problem is reported, in the order email, category, statement, confirmation', () => {
  assert.match(validateAppeal({}).error, /email/i)
  assert.match(validateAppeal({ contactEmail: 'player@example.com' }).error, /reason/i)
  assert.match(validateAppeal({ contactEmail: 'player@example.com', category: 'false-positive' }).error, /statement/i)
  assert.match(validateAppeal({ contactEmail: 'player@example.com', category: 'false-positive', statement }).error, /confirm/i)
})

test('an error message never repeats what was sent', () => {
  for (const body of [
    { ...good, contactEmail: '<script>alert(1)</script>' },
    { ...good, category: '<img src=x onerror=alert(1)>' },
    { ...good, statement: '<b>short</b>' },
  ]) {
    const result = validateAppeal(body)
    assert.equal(result.ok, false)
    assert.ok(!/script|img|<b>/.test(result.error), result.error)
  }
})

test('isDossierId accepts a lower-case slug and nothing else', () => {
  for (const ok of ['himass', 'tanvuu', 'a', 'a-1', 'a'.repeat(32)]) assert.equal(isDossierId(ok), true, ok)
  for (const bad of ['', 'Himass', 'a b', '../x', 'a/b', 'a.b', 'a_b', 'a'.repeat(33), 5, null, undefined, {}, ['himass']]) {
    assert.equal(isDossierId(bad), false, String(bad))
  }
})

// Client and server validation parity (slide 3): the same case gives the same verdict, and the
// server reports the first message the client form would show.
const text = (length) => 'x'.repeat(length)
const email = (length) => `${'a'.repeat(length - 12)}@example.com`
const PARITY_CASES = [
  good,
  { ...good, category: 'missing-context' },
  { ...good, category: 'procedural-error' },
  { ...good, extra: 1 },
  {},
  { ...good, contactEmail: undefined },
  { ...good, contactEmail: '' },
  { ...good, contactEmail: '   ' },
  { ...good, contactEmail: 'plain' },
  { ...good, contactEmail: 'a@b' },
  { ...good, contactEmail: '@b.com' },
  { ...good, contactEmail: 'a b@c.com' },
  { ...good, contactEmail: 'a@b@c.com' },
  { ...good, contactEmail: '  player@example.com  ' },
  { ...good, contactEmail: email(254) },
  { ...good, contactEmail: email(255) },
  { ...good, contactEmail: 5 },
  { ...good, category: undefined },
  { ...good, category: '' },
  { ...good, category: 'False-Positive' },
  { ...good, category: ' false-positive' },
  { ...good, category: 'constructor' },
  { ...good, category: '__proto__' },
  { ...good, category: ['false-positive'] },
  { ...good, statement: undefined },
  { ...good, statement: '' },
  { ...good, statement: ' '.repeat(80) },
  { ...good, statement: text(49) },
  { ...good, statement: text(50) },
  { ...good, statement: `   ${text(49)}   ` },
  { ...good, statement: text(1000) },
  { ...good, statement: ` ${text(1000)} ` },
  { ...good, statement: text(1001) },
  { ...good, statement: 12345 },
  { ...good, confirmed: false },
  { ...good, confirmed: 'true' },
  { ...good, confirmed: 1 },
  { ...good, confirmed: undefined },
  { contactEmail: 'bad', category: 'nope', statement: 'short', confirmed: false },
]

for (const [index, body] of PARITY_CASES.entries()) {
  test(`parity case ${index}: client and server agree`, () => {
    const clientErrors = validateOnClient(body)
    const clientMessages = Object.values(clientErrors)
    const server = validateAppeal(body)
    assert.equal(server.ok, clientMessages.length === 0)
    if (!server.ok) assert.equal(server.error, clientMessages[0])
  })
}
