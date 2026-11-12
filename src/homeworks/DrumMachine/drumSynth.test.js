import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createDrumSynth } from './drumSynth.js'
import { PAD_BY_CODE } from './drumPads.js'

const KICK = PAD_BY_CODE.get('KeyW').recipe
const SNARE = PAD_BY_CODE.get('KeyA').recipe
const T0 = 1.5
const SAMPLE_RATE = 1000

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `expected ${expected}, got ${actual}`)
}

/** Builds a fake AudioContext that records every call into one shared log. */
function makeFakeContext(log, { state = 'running' } = {}) {
  let nextId = 0
  const nodes = []

  function makeParam(owner, name) {
    return {
      value: 0,
      setValueAtTime(value, time) {
        log.push({ op: 'setValueAtTime', owner, name, value, time })
      },
      exponentialRampToValueAtTime(value, time) {
        log.push({ op: 'exponentialRampToValueAtTime', owner, name, value, time })
      },
    }
  }

  function makeNode(kind, extra = {}) {
    const node = {
      id: `${kind}#${nextId++}`,
      kind,
      connect(destination) {
        log.push({ op: 'connect', from: node.id, to: destination.id })
        return destination
      },
      ...extra,
    }
    nodes.push(node)
    return node
  }

  function withSchedule(node) {
    node.start = (time) => log.push({ op: 'start', owner: node.id, time })
    node.stop = (time) => log.push({ op: 'stop', owner: node.id, time })
    return node
  }

  const ctx = {
    currentTime: T0,
    sampleRate: SAMPLE_RATE,
    state,
    destination: { id: 'destination', kind: 'destination' },
    nodes,
    resumeCalls: 0,
    closeCalls: 0,
    createGain() {
      const node = makeNode('gain')
      node.gain = makeParam(node.id, 'gain')
      return node
    },
    createAnalyser() {
      return makeNode('analyser', { fftSize: 0 })
    },
    createOscillator() {
      const node = withSchedule(makeNode('oscillator', { type: '' }))
      node.frequency = makeParam(node.id, 'frequency')
      return node
    },
    createBiquadFilter() {
      const node = makeNode('biquad', { type: '' })
      node.frequency = makeParam(node.id, 'frequency')
      return node
    },
    createBufferSource() {
      return withSchedule(makeNode('bufferSource', { buffer: null }))
    },
    createBuffer(channels, length, sampleRate) {
      const data = new Float32Array(length)
      return { channels, length, sampleRate, getChannelData: () => data }
    },
    resume() {
      ctx.resumeCalls += 1
      return Promise.resolve()
    },
    close() {
      ctx.closeCalls += 1
      return Promise.resolve()
    },
  }
  return ctx
}

function setup(options = {}) {
  const log = []
  const contexts = []
  const synth = createDrumSynth({
    createContext: () => {
      const ctx = makeFakeContext(log, options)
      contexts.push(ctx)
      return ctx
    },
    random: options.random ?? (() => 0.75),
  })
  return { log, contexts, synth }
}

const ofKind = (ctx, kind) => ctx.nodes.filter((n) => n.kind === kind)

test('created, nothing played: no context, analyser is null', () => {
  const { contexts, synth } = setup()
  assert.equal(contexts.length, 0)
  assert.equal(synth.getAnalyser(), null)
})

test('play(kick): routing, oscillator pitch sweep and schedule', () => {
  const { log, contexts, synth } = setup()
  synth.play(KICK)
  assert.equal(contexts.length, 1)
  const ctx = contexts[0]

  const [master] = ofKind(ctx, 'gain')
  const [analyser] = ofKind(ctx, 'analyser')
  assert.equal(master.gain.value, 0.8)
  assert.equal(synth.getAnalyser(), analyser)
  assert.ok(log.some((e) => e.op === 'connect' && e.from === master.id && e.to === analyser.id))
  assert.ok(log.some((e) => e.op === 'connect' && e.from === analyser.id && e.to === 'destination'))

  const oscillators = ofKind(ctx, 'oscillator')
  assert.equal(oscillators.length, 1)
  const [osc] = oscillators
  assert.equal(osc.type, 'sine')

  const freq = log.filter((e) => e.owner === osc.id && e.name === 'frequency')
  assert.equal(freq.length, 2)
  assert.equal(freq[0].op, 'setValueAtTime')
  assert.equal(freq[0].value, 150)
  near(freq[0].time, T0)
  assert.equal(freq[1].op, 'exponentialRampToValueAtTime')
  assert.equal(freq[1].value, 45)
  near(freq[1].time, T0 + 0.4)

  const start = log.find((e) => e.op === 'start' && e.owner === osc.id)
  const stop = log.find((e) => e.op === 'stop' && e.owner === osc.id)
  near(start.time, T0)
  near(stop.time, T0 + 0.42)
})

test('gain envelope: set peak, ramp to 0.0001, both before stop', () => {
  for (const recipe of [KICK, SNARE]) {
    const { log, contexts, synth } = setup()
    synth.play(recipe)
    const [, voice] = ofKind(contexts[0], 'gain')
    const setIndex = log.findIndex(
      (e) => e.op === 'setValueAtTime' && e.owner === voice.id && e.name === 'gain',
    )
    const rampIndex = log.findIndex(
      (e) => e.op === 'exponentialRampToValueAtTime' && e.owner === voice.id && e.name === 'gain',
    )
    const stopIndex = log.findIndex((e) => e.op === 'stop')
    assert.ok(setIndex >= 0 && rampIndex > setIndex && stopIndex > rampIndex)
    assert.equal(log[setIndex].value, recipe.gain)
    near(log[setIndex].time, T0)
    assert.equal(log[rampIndex].value, 0.0001)
    near(log[rampIndex].time, T0 + recipe.durationMs / 1000)
  }
})

test('play(snare): noise buffer from random, highpass at 1500 Hz, scheduled', () => {
  const { log, contexts, synth } = setup({ random: () => 0.75 })
  synth.play(SNARE)
  const ctx = contexts[0]

  const [source] = ofKind(ctx, 'bufferSource')
  assert.ok(source.buffer)
  assert.equal(source.buffer.length, Math.round(SAMPLE_RATE * 0.2))
  const data = source.buffer.getChannelData(0)
  assert.equal(data.length, 200)
  assert.ok(data.every((v) => v === 0.5))

  const [filter] = ofKind(ctx, 'biquad')
  assert.equal(filter.type, 'highpass')
  const freq = log.find((e) => e.owner === filter.id && e.op === 'setValueAtTime')
  assert.equal(freq.value, 1500)
  near(freq.time, T0)

  const start = log.find((e) => e.op === 'start' && e.owner === source.id)
  const stop = log.find((e) => e.op === 'stop' && e.owner === source.id)
  near(start.time, T0)
  near(stop.time, T0 + 0.22)
})

test('second play reuses the same context', () => {
  const { contexts, synth } = setup()
  synth.play(KICK)
  const analyser = synth.getAnalyser()
  synth.play(SNARE)
  assert.equal(contexts.length, 1)
  assert.equal(synth.getAnalyser(), analyser)
})

test('suspended context is resumed', () => {
  const { contexts, synth } = setup({ state: 'suspended' })
  synth.play(KICK)
  assert.equal(contexts[0].resumeCalls, 1)
})

test('unknown recipe kind throws TypeError', () => {
  const { synth } = setup()
  assert.throws(() => synth.play({ kind: 'unknown' }), TypeError)
})

test('close() then play: first context closed once, new context created', () => {
  const { contexts, synth } = setup()
  synth.play(KICK)
  synth.close()
  assert.equal(contexts[0].closeCalls, 1)
  assert.equal(synth.getAnalyser(), null)
  synth.play(KICK)
  assert.equal(contexts.length, 2)
  assert.equal(contexts[0].closeCalls, 1)
  assert.notEqual(contexts[1], contexts[0])
})
