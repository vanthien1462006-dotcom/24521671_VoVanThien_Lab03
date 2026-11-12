import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DRUM_PADS, PAD_BY_CODE } from './drumPads.js'

test('has exactly seven pads', () => {
  assert.equal(DRUM_PADS.length, 7)
})

test('ids and codes are unique', () => {
  const ids = DRUM_PADS.map((p) => p.id)
  const codes = DRUM_PADS.map((p) => p.code)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(new Set(codes).size, codes.length)
})

test('codes are KeyW, KeyA, KeyS, KeyD, KeyJ, KeyK, KeyL in order', () => {
  assert.deepEqual(
    DRUM_PADS.map((p) => p.code),
    ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyJ', 'KeyK', 'KeyL'],
  )
})

test('keyLabel is the last character of code', () => {
  for (const p of DRUM_PADS) {
    assert.equal(p.keyLabel, p.code.slice(-1))
  }
})

test('durationMs and gain are positive numbers, gain at most 1', () => {
  for (const { recipe } of DRUM_PADS) {
    assert.equal(typeof recipe.durationMs, 'number')
    assert.ok(recipe.durationMs > 0)
    assert.equal(typeof recipe.gain, 'number')
    assert.ok(recipe.gain > 0 && recipe.gain <= 1)
  }
})

test('tone recipes fall in pitch and noise recipes have a filter frequency', () => {
  for (const { recipe } of DRUM_PADS) {
    if (recipe.kind === 'tone') {
      assert.ok(recipe.startHz > recipe.endHz && recipe.endHz > 0)
    } else {
      assert.equal(recipe.kind, 'noise')
      assert.ok(recipe.filterHz > 0)
    }
  }
})

test('array, pads and recipes are frozen', () => {
  assert.ok(Object.isFrozen(DRUM_PADS))
  for (const p of DRUM_PADS) {
    assert.ok(Object.isFrozen(p))
    assert.ok(Object.isFrozen(p.recipe))
  }
})

test('PAD_BY_CODE maps codes to pads', () => {
  assert.equal(PAD_BY_CODE.size, 7)
  assert.equal(PAD_BY_CODE.get('KeyW').id, 'kick')
})

test('kick and snare match table 5.4', () => {
  assert.deepEqual(DRUM_PADS.find((p) => p.id === 'kick'), {
    id: 'kick',
    label: 'Kick',
    code: 'KeyW',
    keyLabel: 'W',
    recipe: { kind: 'tone', wave: 'sine', startHz: 150, endHz: 45, durationMs: 400, gain: 0.9 },
  })
  assert.deepEqual(DRUM_PADS.find((p) => p.id === 'snare'), {
    id: 'snare',
    label: 'Snare',
    code: 'KeyA',
    keyLabel: 'A',
    recipe: { kind: 'noise', filter: 'highpass', filterHz: 1500, durationMs: 200, gain: 0.6 },
  })
})
