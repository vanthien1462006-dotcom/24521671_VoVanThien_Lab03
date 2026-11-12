import { test } from 'node:test'
import assert from 'node:assert/strict'
import { WEAPONS, generateKillFeed, filterKillFeed, SAMPLE_KILL_FEED } from './killFeed.js'

const SQUAD_IDS = ['te', 'ces', 'ge', 'agg']

test('WEAPONS lists the six weapons and is frozen', () => {
  assert.deepEqual(WEAPONS, ['M416', 'AKM', 'Beryl M762', 'Kar98k', 'Mini14', 'UMP45'])
  assert.ok(Object.isFrozen(WEAPONS))
})

test('generateKillFeed(120, 2026) returns 120 events', () => {
  assert.equal(generateKillFeed(120, 2026).length, 120)
})

test('event ids run from kf-001 to kf-120', () => {
  const events = generateKillFeed(120, 2026)
  assert.equal(events[0].id, 'kf-001')
  assert.equal(events[9].id, 'kf-010')
  assert.equal(events[119].id, 'kf-120')
  assert.deepEqual(
    events.map((event) => event.id),
    Array.from({ length: 120 }, (_, i) => `kf-${String(i + 1).padStart(3, '0')}`),
  )
})

test('the killer is never the victim and both are known squads', () => {
  for (const event of generateKillFeed(120, 2026)) {
    assert.notEqual(event.killerSquadId, event.victimSquadId)
    assert.ok(SQUAD_IDS.includes(event.killerSquadId))
    assert.ok(SQUAD_IDS.includes(event.victimSquadId))
  }
})

test('every weapon comes from the WEAPONS list', () => {
  for (const event of generateKillFeed(120, 2026)) {
    assert.ok(WEAPONS.includes(event.weapon))
  }
})

test('events have exactly the KillFeedEvent fields', () => {
  for (const event of generateKillFeed(5, 2026)) {
    assert.deepEqual(Object.keys(event), ['id', 'killerSquadId', 'victimSquadId', 'weapon'])
  }
})

test('the same seed gives deepEqual output', () => {
  assert.deepEqual(generateKillFeed(120, 2026), generateKillFeed(120, 2026))
})

test('a different seed gives different output', () => {
  assert.notDeepEqual(generateKillFeed(120, 2026), generateKillFeed(120, 2027))
})

test('the feed and each event are frozen', () => {
  const events = generateKillFeed(10, 2026)
  assert.ok(Object.isFrozen(events))
  for (const event of events) {
    assert.ok(Object.isFrozen(event))
  }
})

test('generateKillFeed(0, 2026) is an empty array', () => {
  assert.deepEqual(generateKillFeed(0, 2026), [])
})

test('the generated feed uses every squad as killer', () => {
  const killers = new Set(generateKillFeed(120, 2026).map((event) => event.killerSquadId))
  assert.deepEqual([...killers].toSorted(), SQUAD_IDS.toSorted())
})

test('SAMPLE_KILL_FEED is 120 events from seed 2026 and is frozen', () => {
  assert.equal(SAMPLE_KILL_FEED.length, 120)
  assert.deepEqual(SAMPLE_KILL_FEED, generateKillFeed(120, 2026))
  assert.ok(Object.isFrozen(SAMPLE_KILL_FEED))
})

test("filterKillFeed(events, 'all') returns every event", () => {
  const result = filterKillFeed(SAMPLE_KILL_FEED, 'all')
  assert.equal(result.length, 120)
  assert.deepEqual(result, SAMPLE_KILL_FEED)
})

test("filterKillFeed(events, 'te') returns only events where te is killer or victim", () => {
  const result = filterKillFeed(SAMPLE_KILL_FEED, 'te')
  assert.ok(result.length > 0)
  assert.ok(result.length < SAMPLE_KILL_FEED.length)
  for (const event of result) {
    assert.ok(event.killerSquadId === 'te' || event.victimSquadId === 'te')
  }
  const expected = SAMPLE_KILL_FEED.filter((event) => event.killerSquadId === 'te' || event.victimSquadId === 'te')
  assert.deepEqual(result, expected)
})

test('filterKillFeed does not change its input', () => {
  const before = JSON.stringify(SAMPLE_KILL_FEED)
  filterKillFeed(SAMPLE_KILL_FEED, 'agg')
  assert.equal(JSON.stringify(SAMPLE_KILL_FEED), before)
})
