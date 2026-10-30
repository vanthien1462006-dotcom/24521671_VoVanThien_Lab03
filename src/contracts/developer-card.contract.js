/**
 * @typedef {'Core' | 'Awareness' | 'Later'} SkillTier
 */

/**
 * @typedef {Object} Skill
 * @property {string} id      Stable unique id. Used as the React key.
 * @property {string} name
 * @property {SkillTier} tier
 */

/**
 * @typedef {Object} DeveloperCardProps
 * @property {string} [fullName]
 * @property {string} [role]
 * @property {string} [avatarUrl]  HTTPS only.
 * @property {Record<string, string | number>} [metrics]  Rendered as dt/dd pairs.
 * @property {Skill[]} [skills]
 */

/**
 * @typedef {Object} SkillBadgeProps
 * @property {string} name
 * @property {SkillTier} [tier]
 */

export {};
