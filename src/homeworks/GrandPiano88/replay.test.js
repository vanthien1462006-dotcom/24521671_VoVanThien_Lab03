import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { getEventListeners } from 'node:events'
import { REPLAY_SPEEDS, buildReplaySchedule, delay, playSequence } from './replay.js'

const F60 = 261.63
const F64 = 329.63
const F67 = 392
const EVENTS = Object.freeze([
  Object.freeze({ midi: 60, freqHz: F60, durationMs: 300, deltaMs: 0 }),
  Object.freeze({ midi: 64, freqHz: F64, durationMs: 100, deltaMs: 500 }),
  Object.freeze({ midi: 67, freqHz: F67, durationMs: 200, deltaMs: 250 }),
])

function times(schedule) {
  return schedule.map((n) => [n.startMs, n.durationMs])
}

test('REPLAY_SPEEDS is frozen 0.5, 1, 2', () => {
  assert.ok(Object.isFrozen(REPLAY_SPEEDS))
  assert.deepEqual([...REPLAY_SPEEDS], [0.5, 1, 2])
})

test('speed 1 keeps the recorded times', () => {
  assert.deepEqual(times(buildReplaySchedule(EVENTS, 1)), [
    [0, 300],
    [500, 100],
    [750, 200],
  ])
})

test('speed 2 halves every time', () => {
  assert.deepEqual(times(buildReplaySchedule(EVENTS, 2)), [
    [0, 150],
    [250, 50],
    [375, 100],
  ])
})

test('speed 0.5 doubles every time', () => {
  assert.deepEqual(times(buildReplaySchedule(EVENTS, 0.5)), [
    [0, 600],
    [1000, 200],
    [1500, 400],
  ])
})

test('speed 3 throws RangeError', () => {
  assert.throws(() => buildReplaySchedule(EVENTS, 3), RangeError)
})

test('empty events give an empty schedule', () => {
  assert.deepEqual(buildReplaySchedule([], 1), [])
})

test('an unknown speed throws even for empty events', () => {
  assert.throws(() => buildReplaySchedule([], 3), RangeError)
})

test('schedule keeps midi and freqHz, and is frozen without mutating the input', () => {
  const schedule = buildReplaySchedule(EVENTS, 1)
  assert.ok(Object.isFrozen(schedule))
  assert.deepEqual(
    schedule.map((n) => [n.midi, n.freqHz]),
    [
      [60, F60],
      [64, F64],
      [67, F67],
    ],
  )
  for (const note of schedule) {
    assert.ok(Object.isFrozen(note))
    assert.deepEqual(Object.keys(note).toSorted(), ['durationMs', 'freqHz', 'midi', 'startMs'])
  }
  assert.equal(EVENTS[1].deltaMs, 500)
})

/** Fake wait: records the requested ms and resolves at once. */
function makeCallRecorder() {
  const calls = []
  const waits = []
  return {
    calls,
    waits,
    onNoteOn: (midi, freqHz) => calls.push(['on', midi, freqHz]),
    onNoteOff: (midi) => calls.push(['off', midi]),
    wait: (ms) => {
      waits.push(ms)
      return Promise.resolve()
    },
  }
}

test('playSequence calls on and off in time order and waits for the total time', async () => {
  const rec = makeCallRecorder()
  await playSequence(buildReplaySchedule(EVENTS, 1), {
    onNoteOn: rec.onNoteOn,
    onNoteOff: rec.onNoteOff,
    delay: rec.wait,
  })

  assert.deepEqual(rec.calls, [
    ['on', 60, F60],
    ['off', 60],
    ['on', 64, F64],
    ['off', 64],
    ['on', 67, F67],
    ['off', 67],
  ])
  assert.deepEqual(rec.waits, [0, 300, 200, 100, 150, 200])
  assert.equal(
    rec.waits.reduce((sum, ms) => sum + ms, 0),
    950,
  )
})

test('playSequence puts an off before an on at the same time and keeps chord order', async () => {
  const rec = makeCallRecorder()
  const schedule = [
    { midi: 60, freqHz: F60, startMs: 0, durationMs: 100 },
    { midi: 64, freqHz: F64, startMs: 0, durationMs: 100 },
    { midi: 60, freqHz: F60, startMs: 100, durationMs: 50 },
  ]
  await playSequence(schedule, {
    onNoteOn: rec.onNoteOn,
    onNoteOff: rec.onNoteOff,
    delay: rec.wait,
  })

  assert.deepEqual(rec.calls, [
    ['on', 60, F60],
    ['on', 64, F64],
    ['off', 60],
    ['off', 64],
    ['on', 60, F60],
    ['off', 60],
  ])
})

test('playSequence with an empty schedule resolves and calls nothing', async () => {
  const rec = makeCallRecorder()
  await playSequence([], {
    onNoteOn: rec.onNoteOn,
    onNoteOff: rec.onNoteOff,
    delay: rec.wait,
  })
  assert.deepEqual(rec.calls, [])
  assert.deepEqual(rec.waits, [])
})

test('playSequence does not mutate the schedule', async () => {
  const rec = makeCallRecorder()
  const schedule = buildReplaySchedule(EVENTS, 1)
  const copy = JSON.stringify(schedule)
  await playSequence(schedule, {
    onNoteOn: rec.onNoteOn,
    onNoteOff: rec.onNoteOff,
    delay: rec.wait,
  })
  assert.equal(JSON.stringify(schedule), copy)
})

test('abort during a delay rejects with AbortError and calls no further onNoteOn', async () => {
  const controller = new AbortController()
  const calls = []
  let waitCount = 0
  const wait = (ms, signal) => {
    waitCount += 1
    if (waitCount === 3) controller.abort()
    return signal.aborted
      ? Promise.reject(new DOMException('Aborted', 'AbortError'))
      : Promise.resolve()
  }

  await assert.rejects(
    playSequence(buildReplaySchedule(EVENTS, 1), {
      onNoteOn: (midi) => calls.push(['on', midi]),
      onNoteOff: (midi) => calls.push(['off', midi]),
      signal: controller.signal,
      delay: wait,
    }),
    { name: 'AbortError' },
  )
  assert.deepEqual(calls, [
    ['on', 60],
    ['off', 60],
  ])
})

test('abort while a callback runs stops before the next callback, even if wait ignores the signal', async () => {
  const controller = new AbortController()
  const calls = []
  await assert.rejects(
    playSequence(buildReplaySchedule(EVENTS, 1), {
      onNoteOn: (midi) => {
        calls.push(['on', midi])
        controller.abort()
      },
      onNoteOff: (midi) => calls.push(['off', midi]),
      signal: controller.signal,
      delay: () => Promise.resolve(),
    }),
    { name: 'AbortError' },
  )
  assert.deepEqual(calls, [['on', 60]])
})

test('delay resolves after ms', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let done = false
  const promise = delay(100).then(() => {
    done = true
  })

  t.mock.timers.tick(99)
  await Promise.resolve()
  assert.equal(done, false)
  t.mock.timers.tick(1)
  await promise
  assert.equal(done, true)
})

test('delay removes its abort listener once it resolves', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const controller = new AbortController()
  const promise = delay(50, controller.signal)
  assert.equal(getEventListeners(controller.signal, 'abort').length, 1)
  t.mock.timers.tick(50)
  await promise
  assert.equal(getEventListeners(controller.signal, 'abort').length, 0)
})

test('delay rejects with AbortError at once when the signal is already aborted', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(delay(100, controller.signal), { name: 'AbortError' })
})

test('delay rejects with AbortError when aborted later and clears its timer', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const clear = mock.method(globalThis, 'clearTimeout')
  const controller = new AbortController()
  const promise = delay(100, controller.signal)

  controller.abort()
  await assert.rejects(promise, { name: 'AbortError' })
  assert.equal(clear.mock.callCount(), 1)
  assert.equal(getEventListeners(controller.signal, 'abort').length, 0)
  clear.mock.restore()
})
