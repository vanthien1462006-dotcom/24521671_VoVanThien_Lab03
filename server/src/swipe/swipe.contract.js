/**
 * @typedef {'LIKE' | 'NOPE' | 'SUPERLIKE'} SwipeAction
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} name
 * @property {number} age
 * @property {string} bio
 */

/**
 * @typedef {Object} SwipeRecord
 * @property {string} id         crypto.randomUUID(), set by the server.
 * @property {string} playerId
 * @property {string} profileId
 * @property {SwipeAction} action
 * @property {string} createdAt  ISO 8601, set by the server.
 */

/**
 * The validated body of POST /api/swipe. Nothing else from the request is stored.
 * @typedef {Object} SwipeInput
 * @property {string} playerId
 * @property {string} profileId
 * @property {SwipeAction} action
 */

/**
 * @typedef {{ ok: true, value: SwipeInput } | { ok: false, error: string }} SwipeValidation
 */

/**
 * `createSwipe` resolves to `{ conflict: true }` when the player already swiped that profile.
 * `deleteLastSwipe` resolves to null when the player has no swipes.
 * @typedef {Object} SwipeRepository
 * @property {() => Promise<Profile[]>} listProfiles                       In deck order.
 * @property {(profileId: string) => Promise<boolean>} hasProfile
 * @property {(playerId: string) => Promise<SwipeRecord[]>} listSwipes     Oldest first.
 * @property {(input: SwipeInput) => Promise<SwipeRecord | { conflict: true }>} createSwipe
 * @property {(playerId: string) => Promise<SwipeRecord | null>} deleteLastSwipe
 * @property {(playerId: string) => Promise<number>} deleteAllSwipes       Number removed.
 */

export {}
