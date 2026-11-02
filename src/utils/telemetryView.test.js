import { test } from 'node:test'
import assert from 'node:assert/strict'
import { IDLE_VIEW, loadingView, successView, errorView } from './telemetryView.js'

const payload = { id: 'te', name: 'The Expendables' }

const cases = [
  ['IDLE_VIEW', () => IDLE_VIEW, { status: 'IDLE', data: null, error: null }],
  ['loadingView()', () => loadingView(), { status: 'LOADING', data: null, error: null }],
  ['successView(data)', () => successView(payload), { status: 'SUCCESS', data: payload, error: null }],
  ['errorView(message)', () => errorView('boom'), { status: 'ERROR', data: null, error: 'boom' }],
]

for (const [label, make, expected] of cases) {
  test(`${label} has the expected shape`, () => {
    assert.deepEqual(make(), expected)
  })

  test(`${label} has exactly the keys status, data, error`, () => {
    assert.deepEqual(Object.keys(make()), ['status', 'data', 'error'])
  })

  test(`${label} is frozen`, () => {
    assert.ok(Object.isFrozen(make()))
  })
}

test('successView keeps the data reference', () => {
  const view = successView(payload)
  assert.equal(view.data, payload)
})

test('errorView keeps the message text', () => {
  assert.equal(errorView('Satellite packet lost').error, 'Satellite packet lost')
})

test('loadingView returns a new object on every call', () => {
  const a = loadingView()
  const b = loadingView()
  assert.notEqual(a, b)
  assert.deepEqual(a, b)
})
