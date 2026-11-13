import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateMessage } from './validateMessage.js'

test('accepts author and text, trimmed', () => {
  assert.deepEqual(validateMessage({ author: ' Ada ', text: ' Hello Mars ' }), {
    ok: true,
    value: { author: 'Ada', text: 'Hello Mars' },
  })
})

test('copies only author and text: extra fields are dropped', () => {
  const result = validateMessage({ author: 'Ada', text: 'Hi', id: 'forged', isAdmin: true })
  assert.deepEqual(result, { ok: true, value: { author: 'Ada', text: 'Hi' } })
})

test('rejects a body that is not a plain object', () => {
  for (const body of [undefined, null, 'text', 42, ['Ada', 'Hi']]) {
    assert.equal(validateMessage(body).ok, false, JSON.stringify(body))
  }
})

test('rejects a missing, blank or non-string author', () => {
  for (const author of [undefined, '', '   ', 7]) {
    const result = validateMessage({ author, text: 'Hi' })
    assert.equal(result.ok, false)
    assert.match(result.error, /author/i)
  }
})

test('rejects a missing, blank or non-string text', () => {
  for (const text of [undefined, '', '   ', {}]) {
    const result = validateMessage({ author: 'Ada', text })
    assert.equal(result.ok, false)
    assert.match(result.error, /text/i)
  }
})

test('limits author to 40 and text to 500 characters', () => {
  assert.equal(validateMessage({ author: 'a'.repeat(41), text: 'Hi' }).ok, false)
  assert.equal(validateMessage({ author: 'Ada', text: 't'.repeat(501) }).ok, false)
  assert.equal(validateMessage({ author: 'a'.repeat(40), text: 't'.repeat(500) }).ok, true)
})
