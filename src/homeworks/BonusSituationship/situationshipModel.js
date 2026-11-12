/** @typedef {import('./situationship.contract.js').RelationshipPhase} RelationshipPhase */
/** @typedef {import('./situationship.contract.js').RelationshipEvent} RelationshipEvent */

export const PHASES = Object.freeze(['FRIENDS', 'DATING_NO_LOVE', 'OFFICIAL_LOVE', 'GHOSTED_EXIT'])

export const EFFORT_WEIGHTS = Object.freeze({ EM: 0.1, AI_DO: 50 })

const TRANSITIONS = Object.freeze({
  FRIENDS: Object.freeze({ START_DATING: 'DATING_NO_LOVE', UNBIND: 'GHOSTED_EXIT' }),
  DATING_NO_LOVE: Object.freeze({
    CONFIRM_LOVE: 'OFFICIAL_LOVE',
    GHOST_TIMEOUT: 'GHOSTED_EXIT',
    UNBIND: 'GHOSTED_EXIT',
  }),
  OFFICIAL_LOVE: Object.freeze({ UNBIND: 'GHOSTED_EXIT' }),
  GHOSTED_EXIT: Object.freeze({ RESET: 'FRIENDS' }),
})

/**
 * Pure transition function. Unknown events leave the phase unchanged.
 * @param {RelationshipPhase} phase
 * @param {RelationshipEvent} event
 * @returns {RelationshipPhase}
 */
export function transition(phase, event) {
  if (!PHASES.includes(phase)) {
    throw new TypeError(`Unknown relationship phase: ${String(phase)}`)
  }
  return TRANSITIONS[phase][event] ?? phase
}

/**
 * @param {number} myTries
 * @param {number} rivalTries
 * @returns {{ myImpact: number, rivalImpact: number, emShare: number }}
 */
export function computeImpacts(myTries, rivalTries) {
  const myImpact = myTries * EFFORT_WEIGHTS.EM
  const rivalImpact = rivalTries * EFFORT_WEIGHTS.AI_DO
  const total = myImpact + rivalImpact
  return { myImpact, rivalImpact, emShare: total === 0 ? 0 : myImpact / total }
}

/**
 * @param {RelationshipPhase} phase
 * @param {number} myImpact
 * @param {number} rivalImpact
 * @returns {boolean}
 */
export function isRedFlag(phase, myImpact, rivalImpact) {
  return phase === 'DATING_NO_LOVE' && myImpact < rivalImpact
}
