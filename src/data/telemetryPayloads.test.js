import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PUBG_VN_SQUADS } from './pubgVnSquads.js'

for (const squad of PUBG_VN_SQUADS) {
  test(`public/telemetry/${squad.id}.json matches the ${squad.id} squad entry`, async () => {
    const url = new URL(`../../public/telemetry/${squad.id}.json`, import.meta.url)
    const payload = JSON.parse(await readFile(url, 'utf8'))
    assert.deepEqual(payload, squad)
  })
}
