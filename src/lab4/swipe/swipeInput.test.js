import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SWIPE_THRESHOLD_PX, classifySwipe, keyToCommand } from './swipeInput.js'

test('the threshold is the 50 px of slide 30', () => {
  assert.equal(SWIPE_THRESHOLD_PX, 50)
})

test('a drag right past the threshold is a LIKE, left is a NOPE, up is a SUPERLIKE', () => {
  assert.equal(classifySwipe(120, 4), 'LIKE')
  assert.equal(classifySwipe(-120, -4), 'NOPE')
  assert.equal(classifySwipe(3, -120), 'SUPERLIKE')
})

test('exactly the threshold is not a swipe, one pixel more is', () => {
  assert.equal(classifySwipe(50, 0), null)
  assert.equal(classifySwipe(51, 0), 'LIKE')
  assert.equal(classifySwipe(-50, 0), null)
  assert.equal(classifySwipe(-51, 0), 'NOPE')
  assert.equal(classifySwipe(0, -50), null)
  assert.equal(classifySwipe(0, -51), 'SUPERLIKE')
})

test('a drag down is not a swipe', () => {
  assert.equal(classifySwipe(0, 200), null)
  assert.equal(classifySwipe(10, 120), null)
})

test('on a diagonal drag the larger axis wins', () => {
  assert.equal(classifySwipe(100, -60), 'LIKE')
  assert.equal(classifySwipe(60, -100), 'SUPERLIKE')
  assert.equal(classifySwipe(-100, -60), 'NOPE')
})

test('a tie between the axes is not a swipe', () => {
  assert.equal(classifySwipe(80, -80), null)
  assert.equal(classifySwipe(-80, -80), null)
})

test('a small move or a click is not a swipe', () => {
  assert.equal(classifySwipe(0, 0), null)
  assert.equal(classifySwipe(30, -30), null)
})

test('a custom threshold is respected', () => {
  assert.equal(classifySwipe(30, 0, 20), 'LIKE')
  assert.equal(classifySwipe(30, 0, 40), null)
})

test('non-finite distances are not swipes', () => {
  assert.equal(classifySwipe(Number.NaN, 0), null)
  assert.equal(classifySwipe(Infinity, 0), null)
  assert.equal(classifySwipe(0, undefined), null)
})

test('arrow keys map to the swipes and Backspace to UNDO, by e.code', () => {
  assert.equal(keyToCommand('ArrowRight'), 'LIKE')
  assert.equal(keyToCommand('ArrowLeft'), 'NOPE')
  assert.equal(keyToCommand('ArrowUp'), 'SUPERLIKE')
  assert.equal(keyToCommand('Backspace'), 'UNDO')
})

test('other codes, including ArrowDown and letters, map to nothing', () => {
  for (const code of ['ArrowDown', 'KeyA', 'KeyZ', 'Space', 'Enter', 'Delete', '', 'constructor', '__proto__']) {
    assert.equal(keyToCommand(code), null, code)
  }
  assert.equal(keyToCommand(undefined), null)
  assert.equal(keyToCommand(null), null)
})
