import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  FIRST_MIDI,
  LAST_MIDI,
  midiToFrequency,
  midiToNoteName,
  buildPianoKeys,
  PIANO_KEYS,
  groupIntoSlots,
  KEY_SLOTS,
} from './pianoKeys.js'

const TOLERANCE = 0.01

function assertClose(actual, expected) {
  assert.ok(
    Math.abs(actual - expected) <= TOLERANCE,
    `expected ${actual} to be within ${TOLERANCE} of ${expected}`,
  )
}

test('range constants are 21 and 108', () => {
  assert.equal(FIRST_MIDI, 21)
  assert.equal(LAST_MIDI, 108)
})

test('length is 88', () => {
  assert.equal(buildPianoKeys().length, 88)
  assert.equal(PIANO_KEYS.length, 88)
})

test('52 white keys and 36 black keys', () => {
  const keys = buildPianoKeys()
  assert.equal(keys.filter((k) => !k.isBlack).length, 52)
  assert.equal(keys.filter((k) => k.isBlack).length, 36)
})

test('first key is A0, midi 21, 27.5 Hz', () => {
  const first = buildPianoKeys()[0]
  assert.equal(first.midi, 21)
  assert.equal(first.noteName, 'A0')
  assert.equal(first.isBlack, false)
  assertClose(first.freqHz, 27.5)
})

test('midi 22 is A#0 and black', () => {
  const key = buildPianoKeys()[1]
  assert.equal(key.midi, 22)
  assert.equal(key.noteName, 'A#0')
  assert.equal(key.isBlack, true)
})

test('midi 60 is C4 at 261.63 Hz', () => {
  const key = buildPianoKeys().find((k) => k.midi === 60)
  assert.equal(key.noteName, 'C4')
  assertClose(key.freqHz, 261.63)
})

test('midi 69 is A4 at 440 Hz', () => {
  const key = buildPianoKeys().find((k) => k.midi === 69)
  assert.equal(key.noteName, 'A4')
  assertClose(key.freqHz, 440)
})

test('last key is C8, midi 108, 4186.01 Hz', () => {
  const keys = buildPianoKeys()
  const last = keys[keys.length - 1]
  assert.equal(last.midi, 108)
  assert.equal(last.noteName, 'C8')
  assert.equal(last.isBlack, false)
  assertClose(last.freqHz, 4186.01)
})

test('midi strictly increases by 1', () => {
  const keys = buildPianoKeys()
  for (let i = 1; i < keys.length; i += 1) {
    assert.equal(keys[i].midi, keys[i - 1].midi + 1)
  }
})

test('array and every key are frozen', () => {
  const keys = buildPianoKeys()
  assert.ok(Object.isFrozen(keys))
  for (const key of keys) {
    assert.ok(Object.isFrozen(key))
  }
  assert.ok(Object.isFrozen(PIANO_KEYS))
})

test('every key has exactly midi, noteName, isBlack, freqHz', () => {
  for (const key of PIANO_KEYS) {
    assert.deepEqual(Object.keys(key).toSorted(), [
      'freqHz',
      'isBlack',
      'midi',
      'noteName',
    ])
  }
})

test('midiToFrequency is unrounded and follows the formula', () => {
  assert.equal(midiToFrequency(69), 440)
  assert.equal(midiToFrequency(81), 880)
  assert.equal(midiToFrequency(57), 220)
  assert.equal(midiToFrequency(60), 440 * 2 ** (-9 / 12))
})

test('midiToNoteName uses sharp names and floor(midi / 12) - 1 octaves', () => {
  assert.equal(midiToNoteName(21), 'A0')
  assert.equal(midiToNoteName(60), 'C4')
  assert.equal(midiToNoteName(61), 'C#4')
  assert.equal(midiToNoteName(108), 'C8')
})

test('PIANO_KEYS equals a fresh buildPianoKeys()', () => {
  assert.deepEqual(PIANO_KEYS, buildPianoKeys())
})

test('groupIntoSlots gives 52 slots, 36 with a black key', () => {
  const slots = groupIntoSlots(PIANO_KEYS)
  assert.equal(slots.length, 52)
  assert.equal(slots.filter((s) => s.black !== null).length, 36)
})

test('slot 0 is A0 with A#0', () => {
  const slot = groupIntoSlots(PIANO_KEYS)[0]
  assert.equal(slot.white.noteName, 'A0')
  assert.equal(slot.black.noteName, 'A#0')
})

test('slot 1 is B0 with no black key', () => {
  const slot = groupIntoSlots(PIANO_KEYS)[1]
  assert.equal(slot.white.noteName, 'B0')
  assert.equal(slot.black, null)
})

test('last slot is C8 with no black key', () => {
  const slots = groupIntoSlots(PIANO_KEYS)
  const last = slots[slots.length - 1]
  assert.equal(last.white.noteName, 'C8')
  assert.equal(last.black, null)
})

test('slots hold all 88 keys, each black key follows its white key', () => {
  const slots = groupIntoSlots(PIANO_KEYS)
  const whites = slots.length
  const blacks = slots.filter((s) => s.black !== null).length
  assert.equal(whites + blacks, 88)
  for (const slot of slots) {
    assert.equal(slot.white.isBlack, false)
    if (slot.black !== null) {
      assert.equal(slot.black.isBlack, true)
      assert.equal(slot.black.midi, slot.white.midi + 1)
    }
  }
})

test('array and every slot are frozen', () => {
  const slots = groupIntoSlots(PIANO_KEYS)
  assert.ok(Object.isFrozen(slots))
  for (const slot of slots) {
    assert.ok(Object.isFrozen(slot))
  }
})

test('groupIntoSlots does not mutate its frozen input', () => {
  const copy = [...PIANO_KEYS]
  groupIntoSlots(PIANO_KEYS)
  assert.deepEqual([...PIANO_KEYS], copy)
})

test('groupIntoSlots throws RangeError when a black key comes first', () => {
  const blackKey = PIANO_KEYS.find((k) => k.isBlack)
  assert.throws(() => groupIntoSlots([blackKey]), RangeError)
})

test('KEY_SLOTS is frozen and equals groupIntoSlots(PIANO_KEYS)', () => {
  assert.ok(Object.isFrozen(KEY_SLOTS))
  assert.equal(KEY_SLOTS.length, 52)
  assert.deepEqual(KEY_SLOTS, groupIntoSlots(PIANO_KEYS))
})
