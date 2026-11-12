import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createTakeRecorder } from './recorder.js'

const F60 = 261.63
const F64 = 329.63

/** A recorder whose clock is a variable the test sets before each call. */
function setup() {
  let time = 0
  const recorder = createTakeRecorder(() => time)
  return {
    recorder,
    at(ms) {
      time = ms
      return recorder
    },
  }
}

test('two separate notes: durations and gaps between starts', () => {
  const { recorder, at } = setup()
  at(0).start()
  at(100).noteOn(60, F60)
  at(400).noteOff(60)
  at(600).noteOn(64, F64)
  at(700).noteOff(64)
  const take = at(800).stop()

  assert.deepEqual(take, [
    { midi: 60, freqHz: F60, durationMs: 300, deltaMs: 0 },
    { midi: 64, freqHz: F64, durationMs: 100, deltaMs: 500 },
  ])
  assert.equal(recorder.isRecording(), false)
})

test('chord: events keep start order, second delta is 0', () => {
  const { at } = setup()
  at(0).start()
  at(0).noteOn(60, F60)
  at(0).noteOn(64, F64)
  at(200).noteOff(60)
  at(250).noteOff(64)
  const take = at(300).stop()

  assert.deepEqual(take, [
    { midi: 60, freqHz: F60, durationMs: 200, deltaMs: 0 },
    { midi: 64, freqHz: F64, durationMs: 250, deltaMs: 0 },
  ])
})

test('a note still held at stop lasts until the stop time', () => {
  const { at } = setup()
  at(0).start()
  at(0).noteOn(60, F60)
  const take = at(900).stop()

  assert.deepEqual(take, [{ midi: 60, freqHz: F60, durationMs: 900, deltaMs: 0 }])
})

test('noteOff without a matching noteOn is ignored', () => {
  const { at } = setup()
  at(0).start()
  at(50).noteOff(60)
  const take = at(100).stop()

  assert.deepEqual(take, [])
})

test('noteOff twice only ends the note once', () => {
  const { at } = setup()
  at(0).start()
  at(10).noteOn(60, F60)
  at(50).noteOff(60)
  at(90).noteOff(60)
  const take = at(100).stop()

  assert.equal(take[0].durationMs, 40)
})

test('a midi that is already held is not recorded twice', () => {
  const { at } = setup()
  at(0).start()
  at(10).noteOn(60, F60)
  at(20).noteOn(60, F60)
  at(70).noteOff(60)
  const take = at(80).stop()

  assert.equal(take.length, 1)
  assert.equal(take[0].durationMs, 60)
})

test('events before start are ignored', () => {
  const { recorder, at } = setup()
  at(0).noteOn(60, F60)
  at(10).noteOff(60)
  assert.equal(recorder.isRecording(), false)
  at(20).start()
  const take = at(30).stop()

  assert.deepEqual(take, [])
})

test('events after stop are ignored', () => {
  const { recorder, at } = setup()
  at(0).start()
  at(10).noteOn(60, F60)
  const take = at(20).stop()
  at(30).noteOn(64, F64)
  at(40).noteOff(60)

  assert.equal(take.length, 1)
  assert.equal(take[0].durationMs, 10)
  assert.equal(recorder.isRecording(), false)
})

test('start clears the previous take and the held notes', () => {
  const { recorder, at } = setup()
  at(0).start()
  at(10).noteOn(60, F60)
  at(20).stop()

  at(100).start()
  assert.equal(recorder.isRecording(), true)
  at(110).noteOn(60, F60)
  at(160).noteOff(60)
  const take = at(170).stop()

  assert.deepEqual(take, [{ midi: 60, freqHz: F60, durationMs: 50, deltaMs: 0 }])
})

test('result is a frozen array of frozen events without startedAt', () => {
  const { at } = setup()
  at(0).start()
  at(10).noteOn(60, F60)
  at(20).noteOff(60)
  const take = at(30).stop()

  assert.ok(Object.isFrozen(take))
  for (const event of take) {
    assert.ok(Object.isFrozen(event))
    assert.deepEqual(Object.keys(event).sort(), [
      'deltaMs',
      'durationMs',
      'freqHz',
      'midi',
    ])
  }
})

test('isRecording follows start and stop', () => {
  const { recorder, at } = setup()
  assert.equal(recorder.isRecording(), false)
  at(0).start()
  assert.equal(recorder.isRecording(), true)
  at(1).stop()
  assert.equal(recorder.isRecording(), false)
})

test('two recorders do not share state', () => {
  const a = createTakeRecorder(() => 0)
  const b = createTakeRecorder(() => 0)
  a.start()
  assert.equal(a.isRecording(), true)
  assert.equal(b.isRecording(), false)
})

test('the default clock is performance.now', () => {
  const recorder = createTakeRecorder()
  recorder.start()
  recorder.noteOn(60, F60)
  recorder.noteOff(60)
  const [event] = recorder.stop()

  assert.ok(event.durationMs >= 0)
  assert.equal(event.deltaMs, 0)
})
