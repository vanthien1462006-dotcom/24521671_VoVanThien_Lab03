/**
 * @typedef {'LIKE' | 'NOPE' | 'SUPERLIKE'} SwipeAction
 */

/**
 * What the player can ask the deck to do. UNDO is not a swipe: it pops the history stack.
 * @typedef {SwipeAction | 'UNDO'} DeckCommand
 */

/**
 * @typedef {Object} Profile
 * @property {string} id      Stable id from the server.
 * @property {string} name    Invented name (sample data).
 * @property {number} age     Adult age, 21 to 35.
 * @property {string} bio     One line.
 */

/**
 * One saved swipe, as the server returns it. The history stack is a list of these, oldest first.
 * @typedef {Object} SwipeRecord
 * @property {string} id         crypto.randomUUID() from the server.
 * @property {string} playerId   Anonymous player id (UUID).
 * @property {string} profileId
 * @property {SwipeAction} action
 * @property {string} createdAt  ISO 8601, set by the server.
 */

/**
 * The only fields the client sends to POST /api/swipe.
 * @typedef {Object} SwipeInput
 * @property {string} playerId
 * @property {string} profileId
 * @property {SwipeAction} action
 */

/**
 * @typedef {{ ok: true, value: SwipeInput } | { ok: false, error: string }} SwipeValidation
 */

export {}
