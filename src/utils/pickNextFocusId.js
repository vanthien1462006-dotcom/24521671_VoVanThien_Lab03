/**
 * Picks the id that should receive focus after an item is deleted.
 * @param {readonly string[]} visibleIds  Ids in display order, before the delete.
 * @param {string} deletedId
 * @returns {string | null}  The next id, else the previous id, else null.
 */
export function pickNextFocusId(visibleIds, deletedId) {
  const index = visibleIds.indexOf(deletedId)
  if (index === -1) return null
  return visibleIds[index + 1] ?? visibleIds[index - 1] ?? null
}
