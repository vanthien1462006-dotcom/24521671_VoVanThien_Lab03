/**
 * @typedef {'FRIENDS' | 'DATING_NO_LOVE' | 'OFFICIAL_LOVE' | 'GHOSTED_EXIT'} RelationshipPhase
 */

/**
 * @typedef {'START_DATING' | 'CONFIRM_LOVE' | 'GHOST_TIMEOUT' | 'UNBIND' | 'RESET'} RelationshipEvent
 */

/**
 * @typedef {Object} EffortSignal
 * @property {string} id           crypto.randomUUID()
 * @property {'EM' | 'AI_DO'} actor
 * @property {'EM' | 'AI_DO'} type Same value as actor (slide 32 log entry shape).
 * @property {number} steps
 * @property {number} multiplier   0.1 for EM, 50 for AI_DO.
 * @property {number} impact       steps × multiplier.
 */

export {};
