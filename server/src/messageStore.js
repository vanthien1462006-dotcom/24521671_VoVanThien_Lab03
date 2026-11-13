/**
 * @typedef {Object} Message
 * @property {string} id          crypto.randomUUID() from the server.
 * @property {string} author
 * @property {string} text
 * @property {string} timestamp   ISO 8601, set by the server.
 */

/** Sample data for the three slide channels. Not real NASA or tribunal messages. */
export const SEED_MESSAGES = Object.freeze({
  nasa: [
    { id: 'seed-nasa-1', author: 'Mission Control', text: 'Sample data: crew briefing at 09:00 UTC.', timestamp: '2026-11-13T01:00:00.000Z' },
    { id: 'seed-nasa-2', author: 'Flight Director', text: 'Sample data: telemetry nominal, go for next phase.', timestamp: '2026-11-13T01:05:00.000Z' },
  ],
  'esports-tribunal': [
    { id: 'seed-et-1', author: 'Tribunal Clerk', text: 'Sample data: appeal hearings open at 14:00.', timestamp: '2026-11-13T02:00:00.000Z' },
  ],
  notNasa: [
    { id: 'seed-nn-1', author: 'Space Fan', text: 'Sample data: this channel is not affiliated with NASA.', timestamp: '2026-11-13T03:00:00.000Z' },
  ],
})

/**
 * In-memory channel store. Lists are replaced, never mutated, and callers get copies.
 * @param {Record<string, readonly Message[]>} seed   Channel id -> initial messages.
 */
export function createMessageStore(seed) {
  const channels = new Map(Object.entries(seed).map(([id, messages]) => [id, [...messages]]))
  return {
    /** @param {string} channelId */
    has: (channelId) => channels.has(channelId),
    /** @param {string} channelId @returns {Message[]} */
    list: (channelId) => [...(channels.get(channelId) ?? [])],
    /** @param {string} channelId @param {Message} message */
    add: (channelId, message) => {
      channels.set(channelId, [...channels.get(channelId), message])
      return message
    },
  }
}
