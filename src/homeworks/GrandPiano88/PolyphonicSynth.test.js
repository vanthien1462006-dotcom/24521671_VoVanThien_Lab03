import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PolyphonicSynth } from './PolyphonicSynth.js'
import { midiToFrequency } from './pianoKeys.js'

const T0 = 2

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `expected ${expected}, got ${actual}`)
}

/** Fake AudioContext that records every call, in order, into one shared log. */
function makeFakeContext(log, { state = 'running' } = {}) {
  let nextId = 0
  const oscillators = []

  function makeParam(owner, name) {
    return {
      value: 0,
      setValueAtTime(value, time) {
        log.push({ op: 'setValueAtTime', owner, name, value, time })
      },
      exponentialRampToValueAtTime(value, time) {
        log.push({ op: 'exponentialRampToValueAtTime', owner, name, value, time })
      },
      cancelScheduledValues(time) {
        log.push({ op: 'cancelScheduledValues', owner, name, time })
      },
    }
  }

  function makeNode(kind) {
    const id = `${kind}#${nextId++}`
    const node = {
      id,
      kind,
      connect(destination) {
        log.push({ op: 'connect', from: id, to: destination.id })
        return destination
      },
      start: (time) => log.push({ op: 'start', owner: id, time }),
      stop: (time) => log.push({ op: 'stop', owner: id, time }),
    }
    return node
  }

  const ctx = {
    currentTime: T0,
    state,
    destination: { id: 'destination', kind: 'destination' },
    oscillators,
    resumeCalls: 0,
    closeCalls: 0,
    close() {
      ctx.closeCalls += 1
      return Promise.resolve()
    },
    createOscillator() {
      const osc = makeNode('osc')
      osc.frequency = makeParam(osc.id, 'frequency')
      oscillators.push(osc)
      return osc
    },
    createGain() {
      const gain = makeNode('gain')
      gain.gain = makeParam(gain.id, 'gain')
      return gain
    },
    resume() {
      ctx.resumeCalls += 1
      return Promise.resolve()
    },
  }
  return ctx
}

function setup({ state, maxVoices } = {}) {
  const log = []
  const contexts = []
  const synth = new PolyphonicSynth(maxVoices, {
    createContext: () => {
      const ctx = makeFakeContext(log, { state })
      contexts.push(ctx)
      return ctx
    },
  })
  return { synth, log, contexts }
}

test('constructed: no context created, voices.size 0, default 8 voices', () => {
  const { synth, contexts } = setup()
  assert.equal(contexts.length, 0)
  assert.equal(synth.ctx, null)
  assert.equal(synth.voices.size, 0)
  assert.equal(synth.maxVoices, 8)
})

test('noteOn creates one context and wires osc -> gain -> destination', () => {
  const { synth, log, contexts } = setup()
  const f = midiToFrequency(60)
  synth.noteOn(60, f)

  assert.equal(contexts.length, 1)
  const [osc] = contexts[0].oscillators
  const connects = log.filter((e) => e.op === 'connect')
  assert.equal(connects.length, 2)
  assert.deepEqual(
    connects.map((e) => [e.from.split('#')[0], e.to.split('#')[0]]),
    [
      ['osc', 'gain'],
      ['gain', 'destination'],
    ],
  )
  assert.equal(connects[0].from, osc.id)
})

test('noteOn sets the frequency, then the attack envelope 0.0001 -> 0.2 in 10 ms', () => {
  const { synth, log } = setup()
  const f = midiToFrequency(60)
  synth.noteOn(60, f)

  const freq = log.find((e) => e.name === 'frequency')
  assert.equal(freq.op, 'setValueAtTime')
  assert.equal(freq.value, f)
  near(freq.time, T0)

  const gainEvents = log.filter((e) => e.name === 'gain')
  assert.equal(gainEvents.length, 2)
  assert.equal(gainEvents[0].op, 'setValueAtTime')
  assert.equal(gainEvents[0].value, 0.0001)
  near(gainEvents[0].time, T0)
  assert.equal(gainEvents[1].op, 'exponentialRampToValueAtTime')
  assert.equal(gainEvents[1].value, 0.2)
  near(gainEvents[1].time, T0 + 0.01)

  const start = log.find((e) => e.op === 'start')
  near(start.time, T0)
  assert.ok(synth.voices.has(60))
  assert.equal(synth.voices.size, 1)
})

test('noteOn for a midi that already sounds is ignored', () => {
  const { synth, log, contexts } = setup()
  synth.noteOn(60, midiToFrequency(60))
  const logLength = log.length
  synth.noteOn(60, midiToFrequency(60))

  assert.equal(synth.voices.size, 1)
  assert.equal(contexts[0].oscillators.length, 1)
  assert.equal(log.length, logLength)
})

test('nine different notes: 8 voices remain, the first is released click-free', () => {
  const { synth, log, contexts } = setup()
  for (let midi = 60; midi < 69; midi += 1) {
    synth.noteOn(midi, midiToFrequency(midi))
  }

  assert.equal(synth.voices.size, 8)
  assert.equal(synth.voices.has(60), false)
  assert.equal(synth.voices.has(68), true)

  const firstOsc = contexts[0].oscillators[0]
  const firstGainId = log.find((e) => e.op === 'connect' && e.from === firstOsc.id).to
  const ramp = log.findIndex(
    (e) =>
      e.op === 'exponentialRampToValueAtTime' &&
      e.owner === firstGainId &&
      e.value === 0.0001,
  )
  const stop = log.findIndex((e) => e.op === 'stop' && e.owner === firstOsc.id)
  assert.ok(ramp >= 0, 'release ramp recorded')
  assert.ok(stop >= 0, 'oscillator stop recorded')
  assert.ok(ramp < stop, 'ramp is recorded before stop')
  near(log[ramp].time, T0 + 0.04)
  near(log[stop].time, T0 + 0.05)
})

test('the stolen voice is released before the new voice starts', () => {
  const { synth, log, contexts } = setup({ maxVoices: 2 })
  synth.noteOn(60, midiToFrequency(60))
  synth.noteOn(61, midiToFrequency(61))
  synth.noteOn(62, midiToFrequency(62))

  const [first, , third] = contexts[0].oscillators
  const stopFirst = log.findIndex((e) => e.op === 'stop' && e.owner === first.id)
  const startThird = log.findIndex((e) => e.op === 'start' && e.owner === third.id)
  assert.ok(stopFirst < startThird)
})

test('after stealing, Map order is notes 2 to 9', () => {
  const { synth } = setup()
  for (let midi = 60; midi < 69; midi += 1) {
    synth.noteOn(midi, midiToFrequency(midi))
  }
  assert.deepEqual([...synth.voices.keys()], [61, 62, 63, 64, 65, 66, 67, 68])
})

test('noteOff releases one voice with the click-free envelope', () => {
  const { synth, log } = setup()
  synth.noteOn(60, midiToFrequency(60))
  const before = log.length
  synth.noteOff(60)

  assert.equal(synth.voices.size, 0)
  const events = log.slice(before)
  assert.deepEqual(
    events.map((e) => e.op),
    ['cancelScheduledValues', 'setValueAtTime', 'exponentialRampToValueAtTime', 'stop'],
  )
  near(events[2].time, T0 + 0.04)
  assert.equal(events[2].value, 0.0001)
  near(events[3].time, T0 + 0.05)
})

test('noteOff holds the current gain, never below 0.0001', () => {
  const { synth, log } = setup()
  synth.noteOn(60, midiToFrequency(60))
  const before = log.length
  synth.noteOff(60)

  const hold = log.slice(before).find((e) => e.op === 'setValueAtTime')
  assert.equal(hold.value, 0.0001)
})

test('noteOff of an unknown midi does not throw and changes nothing', () => {
  const { synth, log, contexts } = setup()
  assert.doesNotThrow(() => synth.noteOff(99))
  assert.equal(contexts.length, 0)

  synth.noteOn(60, midiToFrequency(60))
  const logLength = log.length
  assert.doesNotThrow(() => synth.noteOff(99))
  assert.equal(synth.voices.size, 1)
  assert.equal(log.length, logLength)
})

test('a suspended context is resumed on noteOn', () => {
  const { synth, contexts } = setup({ state: 'suspended' })
  synth.noteOn(60, midiToFrequency(60))
  assert.equal(contexts[0].resumeCalls, 1)
})

test('a running context is not resumed', () => {
  const { synth, contexts } = setup({ state: 'running' })
  synth.noteOn(60, midiToFrequency(60))
  assert.equal(contexts[0].resumeCalls, 0)
})

test('the context is created once and reused', () => {
  const { synth, contexts } = setup()
  synth.noteOn(60, midiToFrequency(60))
  synth.noteOn(61, midiToFrequency(61))
  assert.equal(contexts.length, 1)
})

test('activeCount follows the number of sounding voices', () => {
  const { synth } = setup()
  assert.equal(synth.activeCount, 0)
  synth.noteOn(60, midiToFrequency(60))
  synth.noteOn(64, midiToFrequency(64))
  assert.equal(synth.activeCount, 2)
  synth.noteOff(60)
  assert.equal(synth.activeCount, 1)
})

test('stopAll releases every voice, each ramp recorded before its stop', () => {
  const { synth, log, contexts } = setup()
  const midis = [60, 64, 67]
  for (const midi of midis) synth.noteOn(midi, midiToFrequency(midi))
  const before = log.length
  synth.stopAll()

  assert.equal(synth.voices.size, 0)
  assert.equal(synth.activeCount, 0)
  const released = log.slice(before)
  for (const osc of contexts[0].oscillators) {
    const gainId = log.find((e) => e.op === 'connect' && e.from === osc.id).to
    const ramp = released.findIndex(
      (e) =>
        e.op === 'exponentialRampToValueAtTime' &&
        e.owner === gainId &&
        e.value === 0.0001,
    )
    const stop = released.findIndex((e) => e.op === 'stop' && e.owner === osc.id)
    assert.ok(ramp >= 0, 'release ramp recorded')
    assert.ok(stop >= 0, 'oscillator stop recorded')
    assert.ok(ramp < stop, 'ramp is recorded before stop')
  }
})

test('stopAll without a context or voices does nothing', () => {
  const { synth, contexts } = setup()
  assert.doesNotThrow(() => synth.stopAll())
  assert.equal(contexts.length, 0)
  assert.equal(synth.activeCount, 0)
})

test('close stops all voices, closes the context once and drops it', () => {
  const { synth, contexts } = setup()
  synth.noteOn(60, midiToFrequency(60))
  synth.noteOn(64, midiToFrequency(64))
  synth.close()

  assert.equal(synth.voices.size, 0)
  assert.equal(contexts[0].closeCalls, 1)
  assert.equal(synth.ctx, null)
})

test('close then noteOn creates a new context; the old one closed exactly once', () => {
  const { synth, contexts } = setup()
  synth.noteOn(60, midiToFrequency(60))
  synth.close()
  synth.noteOn(60, midiToFrequency(60))

  assert.equal(contexts.length, 2)
  assert.equal(contexts[0].closeCalls, 1)
  assert.equal(contexts[1].closeCalls, 0)
  assert.equal(synth.ctx, contexts[1])
  assert.ok(synth.voices.has(60))
})

test('close before any noteOn does not throw and creates no context', () => {
  const { synth, contexts } = setup()
  assert.doesNotThrow(() => synth.close())
  assert.equal(contexts.length, 0)
})

test('calling close twice closes the context only once', () => {
  const { synth, contexts } = setup()
  synth.noteOn(60, midiToFrequency(60))
  synth.close()
  synth.close()
  assert.equal(contexts[0].closeCalls, 1)
})
