import crypto from 'node:crypto'

/** @typedef {import('./swipe.contract.js').SwipeRepository} SwipeRepository */
/** @typedef {import('./swipe.contract.js').Profile} Profile */
/** @typedef {import('./swipe.contract.js').SwipeRecord} SwipeRecord */

/**
 * In-memory repository with the same contract as the Mongoose one. It is used by the API tests and
 * by browser checks that run without a database. Every value it hands out is a copy.
 * @param {{ profiles: readonly Profile[], now?: () => Date, makeId?: () => string }} options
 * @returns {SwipeRepository}
 */
export function createMemorySwipeRepository({ profiles, now = () => new Date(), makeId = () => crypto.randomUUID() }) {
  const deck = profiles.map((profile) => ({ ...profile }))
  /** @type {SwipeRecord[]} Oldest first. */
  let swipes = []

  return {
    async listProfiles() {
      return deck.map((profile) => ({ ...profile }))
    },
    async hasProfile(profileId) {
      return deck.some((profile) => profile.id === profileId)
    },
    async listSwipes(playerId) {
      return swipes.filter((swipe) => swipe.playerId === playerId).map((swipe) => ({ ...swipe }))
    },
    async createSwipe({ playerId, profileId, action }) {
      if (swipes.some((swipe) => swipe.playerId === playerId && swipe.profileId === profileId)) {
        return { conflict: true }
      }
      const record = { id: makeId(), playerId, profileId, action, createdAt: now().toISOString() }
      swipes = [...swipes, record]
      return { ...record }
    },
    async deleteLastSwipe(playerId) {
      const index = swipes.findLastIndex((swipe) => swipe.playerId === playerId)
      if (index === -1) return null
      const [removed] = swipes.splice(index, 1)
      swipes = [...swipes]
      return { ...removed }
    },
    async deleteAllSwipes(playerId) {
      const before = swipes.length
      swipes = swipes.filter((swipe) => swipe.playerId !== playerId)
      return before - swipes.length
    },
  }
}
