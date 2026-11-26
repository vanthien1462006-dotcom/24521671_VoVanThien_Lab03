import { test, mock, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { createSlaClock } from './createSlaClock.js'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const START = Date.UTC(2026, 10, 26, 10, 0, 0)
const iso = (ms) => new Date(ms).toISOString()
const flush = () => new Promise((resolve) => setImmediate(resolve))

beforeEach(() => mock.timers.enable({ apis: ['setTimeout', 'Date'], now: START }))
afterEach(() => mock.timers.reset())

/** A page: a document-like and a window-like target that count their listeners. */
function makeTargets() {
  const make = (extra) => {
    const target = Object.assign(new EventTarget(), extra, { added: 0, removed: 0 })
    const add = target.addEventListener.bind(target)
    const remove = target.removeEventListener.bind(target)
    target.addEventListener = (...args) => {
      target.added += 1
      add(...args)
    }
    target.removeEventListener = (...args) => {
      target.removed += 1
      remove(...args)
    }
    return target
  }
  return { visibilityTarget: make({ visibilityState: 'visible' }), pageTarget: make({}) }
}

function show(targets, state) {
  targets.visibilityTarget.visibilityState = state
  targets.visibilityTarget.dispatchEvent(new Event('visibilitychange'))
}

function makeClock(options = {}) {
  const targets = makeTargets()
  const clock = createSlaClock({ deadlineIso: iso(START + 10 * SECOND), ...targets, ...options })
  const seen = []
  const unsubscribe = clock.subscribe(() => seen.push(clock.getSnapshot()))
  return { clock, targets, seen, unsubscribe }
}

/** A fetchServerTime whose answer is controlled by the test. */
function deferredFetch() {
  const calls = []
  const fetchServerTime = ({ signal }) =>
    new Promise((resolve, reject) => {
      calls.push({ signal, resolve, reject })
    })
  return { fetchServerTime, calls }
}

test('the first snapshot is computed from the clock', () => {
  const clock = createSlaClock({ deadlineIso: iso(START + 5300), ...makeTargets() })
  assert.deepEqual(clock.getSnapshot(), {
    totalMs: 5300,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 6,
    expired: false,
    offsetMs: 0,
    syncing: false,
    syncError: null,
  })
})

test('the deadline must be an existing UTC ISO 8601 instant and the offset a finite number', () => {
  for (const deadlineIso of [undefined, '', '2026-11-26', '2026-11-26T10:00:00', '2026-02-30T10:00:00Z', 'tomorrow', 5]) {
    assert.throws(() => createSlaClock({ deadlineIso, ...makeTargets() }), /deadline/i, String(deadlineIso))
  }
  assert.throws(() => createSlaClock({ deadlineIso: iso(START), initialOffsetMs: Number.NaN, ...makeTargets() }), TypeError)
  assert.throws(() => createSlaClock({ deadlineIso: iso(START), initialOffsetMs: '5', ...makeTargets() }), TypeError)
})

test('it ticks exactly when the displayed second changes', () => {
  const { clock, seen } = makeClock({ deadlineIso: iso(START + 5300) })
  mock.timers.tick(299)
  assert.equal(seen.length, 0)
  mock.timers.tick(1)
  assert.equal(seen.length, 1)
  assert.equal(clock.getSnapshot().totalMs, 5000)
  assert.equal(clock.getSnapshot().seconds, 5)
  mock.timers.tick(1000)
  assert.equal(seen.length, 2)
  assert.equal(clock.getSnapshot().seconds, 4)
})

test('the snapshot object is the same between ticks, so React sees no change', () => {
  const { clock } = makeClock({ deadlineIso: iso(START + 5300) })
  const first = clock.getSnapshot()
  mock.timers.tick(100)
  assert.equal(clock.getSnapshot(), first)
  assert.equal(clock.getSnapshot(), clock.getSnapshot())
})

test('after a long freeze the countdown shows the real time left, not one second less', () => {
  const { clock } = makeClock({ deadlineIso: iso(START + 2 * HOUR) })
  mock.timers.setTime(START + 30 * MINUTE + 100)
  mock.timers.tick(1000)
  const expected = 2 * HOUR - (30 * MINUTE + 100 + 1000)
  assert.ok(Math.abs(clock.getSnapshot().totalMs - expected) <= 1000, `${clock.getSnapshot().totalMs} vs ${expected}`)
  assert.equal(clock.getSnapshot().hours, 1)
  assert.equal(clock.getSnapshot().minutes, 29)
})

test('there is no drift over a long run of ticks', () => {
  const { clock } = makeClock({ deadlineIso: iso(START + HOUR) })
  mock.timers.tick(10 * MINUTE)
  assert.equal(clock.getSnapshot().totalMs, 50 * MINUTE)
})

test('an offset of plus one hour means the server is an hour ahead, so an hour less is left', () => {
  const { clock } = makeClock({ deadlineIso: iso(START + 2 * HOUR), initialOffsetMs: HOUR })
  assert.equal(clock.getSnapshot().totalMs, HOUR)
  assert.equal(clock.getSnapshot().offsetMs, HOUR)
})

test('an offset of minus one hour means the local clock is ahead, so an hour more is left', () => {
  const { clock } = makeClock({ deadlineIso: iso(START + HOUR), initialOffsetMs: -HOUR })
  assert.equal(clock.getSnapshot().totalMs, 2 * HOUR)
})

test('it stops at zero: expired, and no further timers or notifications', () => {
  const { clock, seen } = makeClock({ deadlineIso: iso(START + 2 * SECOND) })
  mock.timers.tick(2000)
  assert.equal(clock.getSnapshot().expired, true)
  assert.equal(clock.getSnapshot().totalMs, 0)
  const count = seen.length
  mock.timers.tick(10 * SECOND)
  assert.equal(seen.length, count)
})

test('a deadline in the past is expired from the start', () => {
  const clock = createSlaClock({ deadlineIso: iso(START - HOUR), ...makeTargets() })
  assert.equal(clock.getSnapshot().expired, true)
  assert.equal(clock.getSnapshot().totalMs, 0)
})

test('listeners are attached when the first subscriber arrives and removed with the last', () => {
  const { targets, unsubscribe, clock } = makeClock()
  assert.equal(targets.visibilityTarget.added, 1)
  assert.equal(targets.pageTarget.added, 1)
  const second = clock.subscribe(() => {})
  assert.equal(targets.visibilityTarget.added, 1)
  second()
  assert.equal(targets.visibilityTarget.removed, 0)
  unsubscribe()
  assert.equal(targets.visibilityTarget.removed, 1)
  assert.equal(targets.pageTarget.removed, 1)
})

test('after the last unsubscribe no timer runs', () => {
  const { seen, unsubscribe } = makeClock({ deadlineIso: iso(START + HOUR) })
  unsubscribe()
  mock.timers.tick(10 * SECOND)
  assert.equal(seen.length, 0)
})

test('subscribe, unsubscribe and subscribe again works (React StrictMode) without leaking a listener', () => {
  const targets = makeTargets()
  const clock = createSlaClock({ deadlineIso: iso(START + HOUR), ...targets })
  const first = clock.subscribe(() => {})
  first()
  const seen = []
  const second = clock.subscribe(() => seen.push(1))
  assert.equal(targets.visibilityTarget.added - targets.visibilityTarget.removed, 1)
  for (let i = 0; i < 3; i += 1) mock.timers.tick(SECOND)
  assert.equal(seen.length, 3)
  second()
  assert.equal(targets.visibilityTarget.added - targets.visibilityTarget.removed, 0)
})

test('an unsubscribe function called twice does not remove another subscriber', () => {
  const clock = createSlaClock({ deadlineIso: iso(START + HOUR), ...makeTargets() })
  const seen = []
  const a = clock.subscribe(() => {})
  clock.subscribe(() => seen.push(1))
  a()
  a()
  for (let i = 0; i < 2; i += 1) mock.timers.tick(SECOND)
  assert.equal(seen.length, 2)
})

test('while the page is hidden nothing is scheduled, and on return the value is recomputed', () => {
  const { clock, targets, seen } = makeClock({ deadlineIso: iso(START + HOUR) })
  show(targets, 'hidden')
  const count = seen.length
  mock.timers.tick(5 * MINUTE)
  assert.equal(seen.length, count)
  show(targets, 'visible')
  assert.equal(clock.getSnapshot().totalMs, HOUR - 5 * MINUTE)
  assert.ok(seen.length > count)
})

test('becoming visible re-syncs with the server once', async () => {
  const { fetchServerTime, calls } = deferredFetch()
  const { targets } = makeClock({ fetchServerTime })
  show(targets, 'hidden')
  assert.equal(calls.length, 0)
  show(targets, 'visible')
  assert.equal(calls.length, 1)
})

test('pageshow from the back-forward cache re-syncs, a normal pageshow does not', () => {
  const { fetchServerTime, calls } = deferredFetch()
  const { targets } = makeClock({ fetchServerTime })
  targets.pageTarget.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: false }))
  assert.equal(calls.length, 0)
  targets.pageTarget.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }))
  assert.equal(calls.length, 1)
})

test('a re-sync moves the offset by the estimated difference and re-aims the timer', async () => {
  const clock = createSlaClock({
    deadlineIso: iso(START + 10 * SECOND),
    fetchServerTime: async () => ({ serverNowMs: Date.now() + 4000 }),
    ...makeTargets(),
  })
  clock.subscribe(() => {})
  await clock.resync()
  assert.equal(clock.getSnapshot().offsetMs, 4000)
  assert.equal(clock.getSnapshot().totalMs, 6000)
  assert.equal(clock.getSnapshot().syncing, false)
  assert.equal(clock.getSnapshot().syncError, null)
})

test('the offset uses the middle of the round trip', async () => {
  const clock = createSlaClock({
    deadlineIso: iso(START + HOUR),
    fetchServerTime: async () => {
      mock.timers.setTime(START + 200) // the response took 200 ms
      return { serverNowMs: START + 100 + 4000 } // the server answered in the middle
    },
    ...makeTargets(),
  })
  clock.subscribe(() => {})
  await clock.resync()
  assert.equal(clock.getSnapshot().offsetMs, 4000)
})

test('syncing is true while the request is in flight', async () => {
  const { fetchServerTime, calls } = deferredFetch()
  const clock = createSlaClock({ deadlineIso: iso(START + HOUR), fetchServerTime, ...makeTargets() })
  clock.subscribe(() => {})
  const done = clock.resync()
  assert.equal(clock.getSnapshot().syncing, true)
  calls[0].resolve({ serverNowMs: Date.now() })
  await done
  assert.equal(clock.getSnapshot().syncing, false)
})

test('a response that arrives after the page was hidden again is ignored', async () => {
  const { fetchServerTime, calls } = deferredFetch()
  const { clock, targets } = makeClock({ deadlineIso: iso(START + HOUR), fetchServerTime })
  show(targets, 'hidden')
  show(targets, 'visible')
  show(targets, 'hidden')
  calls[0].resolve({ serverNowMs: Date.now() + HOUR })
  await flush()
  assert.equal(clock.getSnapshot().offsetMs, 0)
  assert.equal(clock.getSnapshot().syncing, false)
})

test('a newer re-sync wins over an older one that answers later', async () => {
  const { fetchServerTime, calls } = deferredFetch()
  const clock = createSlaClock({ deadlineIso: iso(START + HOUR), fetchServerTime, ...makeTargets() })
  clock.subscribe(() => {})
  const first = clock.resync()
  const second = clock.resync()
  assert.equal(calls[0].signal.aborted, true)
  calls[1].resolve({ serverNowMs: Date.now() + 3000 })
  calls[0].resolve({ serverNowMs: Date.now() + 9000 })
  await Promise.all([first, second])
  assert.equal(clock.getSnapshot().offsetMs, 3000)
})

test('a failed re-sync keeps the old offset and reports a fixed message, then a good one clears it', async () => {
  let fail = true
  const clock = createSlaClock({
    deadlineIso: iso(START + HOUR),
    initialOffsetMs: 1500,
    fetchServerTime: async () => {
      if (fail) throw new Error('connect ECONNREFUSED 10.0.0.5:3001')
      return { serverNowMs: Date.now() + 1500 }
    },
    ...makeTargets(),
  })
  clock.subscribe(() => {})
  await clock.resync()
  assert.equal(clock.getSnapshot().offsetMs, 1500)
  assert.equal(clock.getSnapshot().syncing, false)
  assert.match(clock.getSnapshot().syncError, /re-sync/i)
  assert.ok(!clock.getSnapshot().syncError.includes('ECONNREFUSED'))
  fail = false
  await clock.resync()
  assert.equal(clock.getSnapshot().syncError, null)
})

test('a malformed server time is a failed re-sync, not a broken clock', async () => {
  for (const answer of [undefined, null, {}, { serverNowMs: 'now' }, { serverNowMs: Number.NaN }]) {
    const clock = createSlaClock({
      deadlineIso: iso(START + HOUR),
      initialOffsetMs: 700,
      fetchServerTime: async () => answer,
      ...makeTargets(),
    })
    clock.subscribe(() => {})
    await clock.resync()
    assert.equal(clock.getSnapshot().offsetMs, 700, JSON.stringify(answer))
    assert.ok(clock.getSnapshot().syncError !== null, JSON.stringify(answer))
  }
})

test('an AbortError is a normal outcome and sets no error', async () => {
  const clock = createSlaClock({
    deadlineIso: iso(START + HOUR),
    fetchServerTime: async () => {
      throw new DOMException('aborted', 'AbortError')
    },
    ...makeTargets(),
  })
  clock.subscribe(() => {})
  await clock.resync()
  assert.equal(clock.getSnapshot().syncError, null)
  assert.equal(clock.getSnapshot().syncing, false)
})

test('a re-sync without a fetcher does nothing', async () => {
  const clock = createSlaClock({ deadlineIso: iso(START + HOUR), ...makeTargets() })
  await clock.resync()
  assert.equal(clock.getSnapshot().syncing, false)
})

test('a re-sync after expiry can bring the window back when the first estimate was too far ahead', async () => {
  const clock = createSlaClock({
    deadlineIso: iso(START + SECOND),
    initialOffsetMs: 5000,
    fetchServerTime: async () => ({ serverNowMs: Date.now() }),
    ...makeTargets(),
  })
  assert.equal(clock.getSnapshot().expired, true)
  clock.subscribe(() => {})
  await clock.resync()
  assert.equal(clock.getSnapshot().expired, false)
  assert.equal(clock.getSnapshot().totalMs, SECOND)
  mock.timers.tick(SECOND)
  assert.equal(clock.getSnapshot().expired, true)
})

test('dispose aborts the request, removes the listeners, stops the timer and ignores later calls', async () => {
  const { fetchServerTime, calls } = deferredFetch()
  const { clock, targets, seen } = makeClock({ deadlineIso: iso(START + HOUR), fetchServerTime })
  const pending = clock.resync()
  clock.dispose()
  const count = seen.length
  assert.equal(calls[0].signal.aborted, true)
  assert.equal(targets.visibilityTarget.removed, 1)
  assert.equal(targets.pageTarget.removed, 1)
  mock.timers.tick(10 * SECOND)
  assert.equal(seen.length, count)
  calls[0].reject(new DOMException('aborted', 'AbortError'))
  await pending
  await clock.resync()
  assert.equal(calls.length, 1)
  const unsubscribe = clock.subscribe(() => seen.push(1))
  mock.timers.tick(5 * SECOND)
  assert.equal(seen.length, count)
  unsubscribe()
  clock.dispose()
})

test('it works without a document or window (server rendering)', () => {
  const clock = createSlaClock({ deadlineIso: iso(START + 10 * SECOND), visibilityTarget: null, pageTarget: null })
  const unsubscribe = clock.subscribe(() => {})
  mock.timers.tick(SECOND)
  assert.equal(clock.getSnapshot().totalMs, 9000)
  unsubscribe()
})
