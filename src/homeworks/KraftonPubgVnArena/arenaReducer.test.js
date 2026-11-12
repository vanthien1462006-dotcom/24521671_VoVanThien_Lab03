import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createArenaState, arenaReducer } from './arenaReducer.js'

/** Freezes the state and its three maps, so any mutation throws in strict mode. */
function deepFreezeState(state) {
  Object.freeze(state.stock)
  Object.freeze(state.pending)
  Object.freeze(state.owned)
  return Object.freeze(state)
}

function initialState() {
  return deepFreezeState({ stock: { a: 2 }, pending: {}, owned: {}, lastError: null })
}

test('createArenaState copies displayed stock by crate id', () => {
  const state = createArenaState([
    { id: 'a', title: 'A', priceVnd: 1, remainingStock: 2, dropEpochMs: 0 },
    { id: 'b', title: 'B', priceVnd: 1, remainingStock: 0, dropEpochMs: 0 },
  ])
  assert.deepEqual(state, { stock: { a: 2, b: 0 }, pending: {}, owned: {}, lastError: null })
})

test('CLAIM_STARTED lowers stock by one and sets pending', () => {
  const state = initialState()
  const next = arenaReducer(state, { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c1' })
  assert.deepEqual(next.stock, { a: 1 })
  assert.deepEqual(next.pending, { a: 'c1' })
  assert.deepEqual(next.owned, {})
  assert.equal(next.lastError, null)
})

test('CLAIM_STARTED returns a new state and leaves the input untouched', () => {
  const state = initialState()
  const next = arenaReducer(state, { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c1' })
  assert.notEqual(next, state)
  assert.deepEqual(state, { stock: { a: 2 }, pending: {}, owned: {}, lastError: null })
})

test('CLAIM_STARTED clears a previous error', () => {
  const state = deepFreezeState({ stock: { a: 2 }, pending: {}, owned: {}, lastError: 'Looted Out' })
  const next = arenaReducer(state, { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c1' })
  assert.equal(next.lastError, null)
})

test('a second CLAIM_STARTED while pending returns the same object (lock)', () => {
  const started = arenaReducer(initialState(), { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c1' })
  deepFreezeState(started)
  const again = arenaReducer(started, { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c2' })
  assert.equal(again, started)
})

test('CLAIM_STARTED when stock is 0 returns the same object', () => {
  const state = deepFreezeState({ stock: { a: 0 }, pending: {}, owned: {}, lastError: null })
  const next = arenaReducer(state, { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c1' })
  assert.equal(next, state)
})

test('CLAIM_STARTED for an unknown crate returns the same object', () => {
  const state = initialState()
  const next = arenaReducer(state, { type: 'CLAIM_STARTED', crateId: 'zzz', claimId: 'c1' })
  assert.equal(next, state)
})

test('CLAIM_CONFIRMED sets server stock, clears pending and adds one owned', () => {
  const started = deepFreezeState(
    arenaReducer(initialState(), { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c1' }),
  )
  const next = arenaReducer(started, {
    type: 'CLAIM_CONFIRMED',
    crateId: 'a',
    claimId: 'c1',
    remainingStock: 1,
  })
  assert.deepEqual(next.stock, { a: 1 })
  assert.deepEqual(next.pending, {})
  assert.deepEqual(next.owned, { a: 1 })
  assert.notEqual(next, started)
  assert.deepEqual(started.pending, { a: 'c1' })
})

test('CLAIM_CONFIRMED applies the server value even when it differs from the optimistic one', () => {
  const started = deepFreezeState(
    arenaReducer(initialState(), { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c1' }),
  )
  const next = arenaReducer(started, {
    type: 'CLAIM_CONFIRMED',
    crateId: 'a',
    claimId: 'c1',
    remainingStock: 0,
  })
  assert.deepEqual(next.stock, { a: 0 })
})

test('CLAIM_CONFIRMED adds to an existing owned count', () => {
  const state = deepFreezeState({ stock: { a: 1 }, pending: { a: 'c2' }, owned: { a: 1 }, lastError: null })
  const next = arenaReducer(state, {
    type: 'CLAIM_CONFIRMED',
    crateId: 'a',
    claimId: 'c2',
    remainingStock: 0,
  })
  assert.deepEqual(next.owned, { a: 2 })
})

test('CLAIM_CONFIRMED keeps pending claims of other crates', () => {
  const state = deepFreezeState({
    stock: { a: 1, b: 1 },
    pending: { a: 'c1', b: 'c2' },
    owned: {},
    lastError: null,
  })
  const next = arenaReducer(state, {
    type: 'CLAIM_CONFIRMED',
    crateId: 'a',
    claimId: 'c1',
    remainingStock: 1,
  })
  assert.deepEqual(next.pending, { b: 'c2' })
})

test('CLAIM_CONFIRMED with a claimId that is not pending returns the same object', () => {
  const started = deepFreezeState(
    arenaReducer(initialState(), { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c1' }),
  )
  const next = arenaReducer(started, {
    type: 'CLAIM_CONFIRMED',
    crateId: 'a',
    claimId: 'other',
    remainingStock: 1,
  })
  assert.equal(next, started)
})

test('DISMISS_ERROR clears lastError', () => {
  const state = deepFreezeState({ stock: { a: 0 }, pending: {}, owned: {}, lastError: 'Looted Out' })
  const next = arenaReducer(state, { type: 'DISMISS_ERROR' })
  assert.equal(next.lastError, null)
  assert.notEqual(next, state)
  assert.equal(state.lastError, 'Looted Out')
})

test('DISMISS_ERROR with no error returns the same object', () => {
  const state = initialState()
  assert.equal(arenaReducer(state, { type: 'DISMISS_ERROR' }), state)
})

test('an unknown action type throws TypeError', () => {
  assert.throws(() => arenaReducer(initialState(), { type: 'NOPE' }), TypeError)
})

function startedState() {
  return deepFreezeState(arenaReducer(initialState(), { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c1' }))
}

test('CLAIM_REJECTED applies the server stock, clears pending, keeps owned empty and sets lastError', () => {
  const started = startedState()
  const next = arenaReducer(started, {
    type: 'CLAIM_REJECTED',
    crateId: 'a',
    claimId: 'c1',
    remainingStock: 0,
    error: 'Looted Out',
  })
  assert.deepEqual(next.stock, { a: 0 })
  assert.deepEqual(next.pending, {})
  assert.deepEqual(next.owned, {})
  assert.equal(next.lastError, 'Looted Out')
  assert.notEqual(next, started)
  assert.deepEqual(started.stock, { a: 1 })
  assert.deepEqual(started.pending, { a: 'c1' })
})

test('CLAIM_REJECTED without remainingStock restores the stock from before the claim', () => {
  const next = arenaReducer(startedState(), {
    type: 'CLAIM_REJECTED',
    crateId: 'a',
    claimId: 'c1',
    error: 'Looted Out',
  })
  assert.deepEqual(next.stock, { a: 2 })
  assert.deepEqual(next.pending, {})
  assert.equal(next.lastError, 'Looted Out')
})

test('CLAIM_REJECTED with a non-finite remainingStock restores the stock from before the claim', () => {
  const next = arenaReducer(startedState(), {
    type: 'CLAIM_REJECTED',
    crateId: 'a',
    claimId: 'c1',
    remainingStock: NaN,
    error: 'Looted Out',
  })
  assert.deepEqual(next.stock, { a: 2 })
})

test('CLAIM_REJECTED without an error message uses Claim failed', () => {
  const next = arenaReducer(startedState(), { type: 'CLAIM_REJECTED', crateId: 'a', claimId: 'c1' })
  assert.equal(next.lastError, 'Claim failed')
})

test('CLAIM_REJECTED with a claimId that is not pending returns the same object', () => {
  const started = startedState()
  const next = arenaReducer(started, {
    type: 'CLAIM_REJECTED',
    crateId: 'a',
    claimId: 'other',
    remainingStock: 0,
    error: 'Looted Out',
  })
  assert.equal(next, started)
})

test('CLAIM_REJECTED when nothing is pending returns the same object', () => {
  const state = initialState()
  const next = arenaReducer(state, {
    type: 'CLAIM_REJECTED',
    crateId: 'a',
    claimId: 'c1',
    remainingStock: 0,
    error: 'Looted Out',
  })
  assert.equal(next, state)
})

test('CLAIM_REJECTED keeps pending claims of other crates', () => {
  const state = deepFreezeState({
    stock: { a: 1, b: 1 },
    pending: { a: 'c1', b: 'c2' },
    owned: {},
    lastError: null,
  })
  const next = arenaReducer(state, {
    type: 'CLAIM_REJECTED',
    crateId: 'a',
    claimId: 'c1',
    remainingStock: 0,
    error: 'Looted Out',
  })
  assert.deepEqual(next.pending, { b: 'c2' })
  assert.deepEqual(next.stock, { a: 0, b: 1 })
})

test('CLAIM_ABORTED restores the stock and clears pending without setting an error', () => {
  const started = startedState()
  const next = arenaReducer(started, { type: 'CLAIM_ABORTED', crateId: 'a', claimId: 'c1' })
  assert.deepEqual(next.stock, { a: 2 })
  assert.deepEqual(next.pending, {})
  assert.equal(next.lastError, null)
  assert.notEqual(next, started)
  assert.deepEqual(started.stock, { a: 1 })
})

test('CLAIM_ABORTED with a claimId that is not pending returns the same object', () => {
  const started = startedState()
  const next = arenaReducer(started, { type: 'CLAIM_ABORTED', crateId: 'a', claimId: 'other' })
  assert.equal(next, started)
})

test('after CLAIM_REJECTED the crate can be claimed again', () => {
  const rejected = deepFreezeState(
    arenaReducer(startedState(), {
      type: 'CLAIM_REJECTED',
      crateId: 'a',
      claimId: 'c1',
      error: 'Looted Out',
    }),
  )
  const again = arenaReducer(rejected, { type: 'CLAIM_STARTED', crateId: 'a', claimId: 'c2' })
  assert.deepEqual(again.pending, { a: 'c2' })
  assert.deepEqual(again.stock, { a: 1 })
})
