import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PUBG_VN_SQUADS } from './pubgVnSquads.js'

test('has exactly three entries', () => {
  assert.equal(PUBG_VN_SQUADS.length, 3)
})

test('ids are ces, te, ge in order and unique', () => {
  const ids = PUBG_VN_SQUADS.map((s) => s.id)
  assert.deepEqual(ids, ['ces', 'te', 'ge'])
  assert.equal(new Set(ids).size, ids.length)
})

test('text fields are non-empty strings, alive and kills are integers >= 0', () => {
  for (const s of PUBG_VN_SQUADS) {
    for (const key of ['name', 'map', 'phase', 'wwcdProb', 'status']) {
      assert.equal(typeof s[key], 'string')
      assert.ok(s[key].length > 0)
    }
    assert.ok(Number.isInteger(s.alive) && s.alive >= 0)
    assert.ok(Number.isInteger(s.kills) && s.kills >= 0)
  }
})

test('wwcdProb is a percentage string', () => {
  for (const s of PUBG_VN_SQUADS) {
    assert.match(s.wwcdProb, /^\d{1,3}%$/)
  }
})

test('the array and every entry are frozen', () => {
  assert.ok(Object.isFrozen(PUBG_VN_SQUADS))
  for (const s of PUBG_VN_SQUADS) {
    assert.ok(Object.isFrozen(s))
  }
})

test('entries match the section 4.4 table', () => {
  assert.deepEqual(PUBG_VN_SQUADS, [
    {
      id: 'ces',
      name: 'Cerberus Esports',
      map: 'Erangel',
      phase: 'Phase 6',
      alive: 4,
      kills: 14,
      wwcdProb: '68%',
      status: 'In Safe Zone',
    },
    {
      id: 'te',
      name: 'The Expendables',
      map: 'Miramar',
      phase: 'Phase 7',
      alive: 4,
      kills: 18,
      wwcdProb: '82%',
      status: 'Holding High Ground',
    },
    {
      id: 'ge',
      name: 'Genius Esports',
      map: 'Taego',
      phase: 'Phase 5',
      alive: 3,
      kills: 9,
      wwcdProb: '41%',
      status: 'Rotating Blue Zone',
    },
  ])
})
