/**
 * @typedef {Object} Pioneer
 * @property {string} id    Stable unique id. Used as the React key.
 * @property {string} name
 * @property {number} age
 * @property {number} iq
 */

/**
 * @typedef {'iq-desc' | 'age-asc'} PioneerSortKey
 */

/**
 * @typedef {Object} PioneerFilter
 * @property {string} query  Matched case-insensitively, after trimming.
 * @property {number} minIq
 * @property {PioneerSortKey} sortBy
 */

/**
 * @typedef {Object} ScientistDirectoryProps
 * @property {readonly Pioneer[]} [initialData]  Defaults to SMART_PEOPLE.
 */

export {};
