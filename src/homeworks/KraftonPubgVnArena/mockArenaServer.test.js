import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createMockArenaServer } from './mockArenaServer.js'

/** Fake wait: resolves at once, or rejects with an AbortError when the signal is already aborted. */
function instant(_ms, signal) {
  if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  return Promise.resolve()
}

function makeServer() {
  return createMockArenaServer({ serverStock: { a: 1, b: 0 }, delay: instant })
}

test('claimCrate on a crate in stock answers 200 with the remaining server stock', async () => {
  const server = makeServer()
  assert.deepEqual(await server.claimCrate('a', 'c1'), { status: 200, remainingStock: 0 })
  assert.equal(server.peekStock('a'), 0)
})

test('the same claimId answers the same and does not decrement twice', async () => {
  const server = createMockArenaServer({ serverStock: { a: 2 }, delay: instant })
  const first = await server.claimCrate('a', 'c1')
  const second = await server.claimCrate('a', 'c1')
  assert.deepEqual(first, { status: 200, remainingStock: 1 })
  assert.deepEqual(second, first)
  assert.equal(server.peekStock('a'), 1)
})

test('a different claimId on an empty crate answers 409 Looted Out', async () => {
  const server = makeServer()
  await server.claimCrate('a', 'c1')
  assert.deepEqual(await server.claimCrate('a', 'c2'), {
    status: 409,
    error: 'Looted Out',
    remainingStock: 0,
  })
})

test('a crate that starts empty answers 409', async () => {
  const server = makeServer()
  const response = await server.claimCrate('b', 'c3')
  assert.equal(response.status, 409)
  assert.equal(response.error, 'Looted Out')
  assert.equal(server.peekStock('b'), 0)
})

test('an unknown crate rejects with TypeError', async () => {
  const server = makeServer()
  await assert.rejects(() => server.claimCrate('zzz', 'c4'), TypeError)
})

test('an aborted signal rejects with AbortError and leaves the stock unchanged', async () => {
  const server = makeServer()
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(
    () => server.claimCrate('a', 'c1', { signal: controller.signal }),
    (error) => error.name === 'AbortError',
  )
  assert.equal(server.peekStock('a'), 1)
})

test('an abort during the latency wait rejects and the claim is not applied', async () => {
  const controller = new AbortController()
  const slowWait = (_ms, signal) =>
    new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    })
  const server = createMockArenaServer({ serverStock: { a: 1 }, delay: slowWait })
  const pending = server.claimCrate('a', 'c1', { signal: controller.signal })
  controller.abort()
  await assert.rejects(pending, (error) => error.name === 'AbortError')
  assert.equal(server.peekStock('a'), 1)
})

test('an aborted claim can be retried with the same claimId and is applied once', async () => {
  const server = makeServer()
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(() => server.claimCrate('a', 'c1', { signal: controller.signal }))
  assert.deepEqual(await server.claimCrate('a', 'c1'), { status: 200, remainingStock: 0 })
})

test('the wait receives latencyMs (default 800) and the signal', async () => {
  const calls = []
  const spy = (ms, signal) => {
    calls.push({ ms, signal })
    return Promise.resolve()
  }
  const controller = new AbortController()
  const server = createMockArenaServer({ serverStock: { a: 3 }, delay: spy })
  await server.claimCrate('a', 'c1', { signal: controller.signal })
  const custom = createMockArenaServer({ serverStock: { a: 3 }, latencyMs: 50, delay: spy })
  await custom.claimCrate('a', 'c1')
  assert.deepEqual(calls.map((call) => call.ms), [800, 50])
  assert.equal(calls[0].signal, controller.signal)
})

test('the server keeps its own copy of serverStock', async () => {
  const input = { a: 1 }
  const server = createMockArenaServer({ serverStock: input, delay: instant })
  await server.claimCrate('a', 'c1')
  assert.deepEqual(input, { a: 1 })
})

test('responses are frozen', async () => {
  const server = makeServer()
  assert.ok(Object.isFrozen(await server.claimCrate('a', 'c1')))
  assert.ok(Object.isFrozen(await server.claimCrate('b', 'c2')))
})
