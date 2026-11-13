import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pickNamedExport } from './lazyNamed.js'

function DrumMachine() {
  return null
}

test('pickNamedExport maps a named export to the default export React.lazy needs', async () => {
  const load = pickNamedExport(async () => ({ DrumMachine }), 'DrumMachine')
  const module = await load()
  assert.equal(module.default, DrumMachine)
})

test('pickNamedExport does not call the loader before React asks for it', () => {
  let calls = 0
  pickNamedExport(async () => {
    calls += 1
    return { DrumMachine }
  }, 'DrumMachine')
  assert.equal(calls, 0)
})

test('pickNamedExport rejects when the named export is missing', async () => {
  const load = pickNamedExport(async () => ({ Other: DrumMachine }), 'DrumMachine')
  await assert.rejects(load, /DrumMachine/)
})

test('pickNamedExport passes loader failures through', async () => {
  const load = pickNamedExport(async () => {
    throw new Error('chunk failed')
  }, 'DrumMachine')
  await assert.rejects(load, /chunk failed/)
})
