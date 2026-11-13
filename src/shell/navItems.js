/**
 * @typedef {Object} NavItem
 * @property {string} to      Absolute route path. Also the React key.
 * @property {string} label   Visible link text.
 * @property {boolean} [end]  Match the path exactly (only the home link).
 */

/** @type {readonly NavItem[]} */
export const NAV_ITEMS = Object.freeze([
  Object.freeze({ to: '/', label: 'Lab 3 Exercises', end: true }),
  Object.freeze({ to: '/hw1', label: 'HW1 Drum Kit' }),
  Object.freeze({ to: '/hw2', label: 'HW2 Piano 88' }),
  Object.freeze({ to: '/hw3', label: 'HW3 PUBG VN Arena' }),
  Object.freeze({ to: '/bonus', label: 'Bonus Exercise' }),
  Object.freeze({ to: '/people', label: 'Ex 1.2.2 People' }),
  Object.freeze({ to: '/form', label: 'Ex 1.3 Form' }),
])
