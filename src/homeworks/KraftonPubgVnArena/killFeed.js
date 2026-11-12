import { SQUAD_STANDINGS } from './arenaData.js'

/** @typedef {import('./pubg-vn-arena.contract.js').KillFeedEvent} KillFeedEvent */

export const WEAPONS = Object.freeze(['M416', 'AKM', 'Beryl M762', 'Kar98k', 'Mini14', 'UMP45'])

/**
 * Small seeded PRNG (mulberry32). The same seed always gives the same sequence.
 * @param {number} seed
 * @returns {() => number} Returns a number in [0, 1).
 */
function createRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Deterministic sample kill feed. The killer never equals the victim.
 * @param {number} count
 * @param {number} seed
 * @returns {ReadonlyArray<Readonly<KillFeedEvent>>}
 */
export function generateKillFeed(count, seed) {
  const random = createRandom(seed)
  const squadIds = SQUAD_STANDINGS.map((row) => row.squadId)
  const events = Array.from({ length: count }, (_, i) => {
    const killerSquadId = squadIds[Math.floor(random() * squadIds.length)]
    const victims = squadIds.filter((id) => id !== killerSquadId)
    const victimSquadId = victims[Math.floor(random() * victims.length)]
    const weapon = WEAPONS[Math.floor(random() * WEAPONS.length)]
    return Object.freeze({
      id: `kf-${String(i + 1).padStart(3, '0')}`,
      killerSquadId,
      victimSquadId,
      weapon,
    })
  })
  return Object.freeze(events)
}

export const SAMPLE_KILL_FEED = generateKillFeed(120, 2026)

/**
 * Keeps only the events where the squad is the killer or the victim.
 * @param {ReadonlyArray<KillFeedEvent>} events
 * @param {string} squadId A squad id, or 'all' for every event.
 * @returns {ReadonlyArray<KillFeedEvent>}
 */
export function filterKillFeed(events, squadId) {
  if (squadId === 'all') return events
  return events.filter((event) => event.killerSquadId === squadId || event.victimSquadId === squadId)
}
