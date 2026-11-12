/** @typedef {import('./drum-machine.contract.js').KeyGuardEvent} KeyGuardEvent */

const EDITABLE_TAGS = Object.freeze(['INPUT', 'TEXTAREA', 'SELECT'])

/**
 * Decides whether a keydown may trigger a drum pad shortcut.
 * Does not check the key code; the keyboard hook maps e.code itself.
 * @param {KeyGuardEvent} event
 * @param {boolean} isEnabled
 * @returns {boolean}
 */
export function shouldHandleKey(event, isEnabled) {
  if (!isEnabled) return false
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return false
  const target = event.target
  if (target?.isContentEditable) return false
  if (target?.tagName && EDITABLE_TAGS.includes(target.tagName)) return false
  return true
}
