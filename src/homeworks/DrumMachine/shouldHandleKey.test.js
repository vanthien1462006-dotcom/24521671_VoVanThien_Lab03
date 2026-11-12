import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shouldHandleKey } from './shouldHandleKey.js'

const base = Object.freeze({
  code: 'KeyW',
  repeat: false,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
  target: { tagName: 'BUTTON' },
})

test('base event, enabled: true', () => {
  assert.equal(shouldHandleKey({ ...base }, true), true)
})

test('base event, disabled: false', () => {
  assert.equal(shouldHandleKey({ ...base }, false), false)
})

test('repeat: true -> false', () => {
  assert.equal(shouldHandleKey({ ...base, repeat: true }, true), false)
})

test('ctrlKey: true -> false', () => {
  assert.equal(shouldHandleKey({ ...base, ctrlKey: true }, true), false)
})

test('altKey: true -> false', () => {
  assert.equal(shouldHandleKey({ ...base, altKey: true }, true), false)
})

test('metaKey: true -> false', () => {
  assert.equal(shouldHandleKey({ ...base, metaKey: true }, true), false)
})

test("target tagName 'INPUT' -> false", () => {
  assert.equal(shouldHandleKey({ ...base, target: { tagName: 'INPUT' } }, true), false)
})

test("target tagName 'TEXTAREA' -> false", () => {
  assert.equal(shouldHandleKey({ ...base, target: { tagName: 'TEXTAREA' } }, true), false)
})

test("target tagName 'SELECT' -> false", () => {
  assert.equal(shouldHandleKey({ ...base, target: { tagName: 'SELECT' } }, true), false)
})

test('contenteditable target -> false', () => {
  assert.equal(
    shouldHandleKey({ ...base, target: { tagName: 'P', isContentEditable: true } }, true),
    false,
  )
})

test('target null -> true', () => {
  assert.equal(shouldHandleKey({ ...base, target: null }, true), true)
})
