import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  SEMITONE_BY_CODE,
  OCTAVES,
  DEFAULT_OCTAVE,
  computerKeyToMidi,
} from './computerKeyMap.js'

const ROWS = [
  ['KeyA', 4, 60],
  ['KeyW', 4, 61],
  ['KeyJ', 4, 71],
  ['KeyK', 4, 72],
  ['KeyA', 0, null],
  ['KeyH', 0, 21],
  ['KeyK', 7, 108],
  ['KeyW', 7, 97],
  ['KeyK', 8, null],
  ['KeyQ', 4, null],
]

for (const [code, octave, expected] of ROWS) {
  test(`computerKeyToMidi(${code}, ${octave}) is ${expected}`, () => {
    assert.equal(computerKeyToMidi(code, octave), expected)
  })
}

test('SEMITONE_BY_CODE has 13 codes mapping to semitones 0 to 12', () => {
  assert.ok(SEMITONE_BY_CODE instanceof Map)
  assert.equal(SEMITONE_BY_CODE.size, 13)
  assert.deepEqual(
    [...SEMITONE_BY_CODE.values()].sort((a, b) => a - b),
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  )
  for (const code of SEMITONE_BY_CODE.keys()) {
    assert.match(code, /^Key[A-Z]$/)
  }
})

test('OCTAVES is frozen 1 to 7 and the default octave is in it', () => {
  assert.ok(Object.isFrozen(OCTAVES))
  assert.deepEqual([...OCTAVES], [1, 2, 3, 4, 5, 6, 7])
  assert.equal(DEFAULT_OCTAVE, 4)
  assert.ok(OCTAVES.includes(DEFAULT_OCTAVE))
})

test('every mapped code gives a midi inside 21 to 108 for each listed octave', () => {
  for (const code of SEMITONE_BY_CODE.keys()) {
    for (const octave of OCTAVES) {
      const midi = computerKeyToMidi(code, octave)
      assert.ok(midi >= 21 && midi <= 108, `${code} at octave ${octave} gave ${midi}`)
    }
  }
})
