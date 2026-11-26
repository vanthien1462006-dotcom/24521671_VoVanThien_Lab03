/** @typedef {import('./appeal.contract.js').MatrixRow} MatrixRow */
/** @typedef {import('./appeal.contract.js').MatrixCell} MatrixCell */

/** An index above this is over-represented (flags exceed the share of matches by more than a quarter). */
export const OVER_THRESHOLD = 1.25
/** An index below this is under-represented. */
export const UNDER_THRESHOLD = 0.8
/** With fewer flags than this in total, no row is judged: the sample is too small. */
export const MIN_TOTAL_EVENTS = 5

// OVER_THRESHOLD is 5/4 and UNDER_THRESHOLD is 4/5. The verdict is decided with these integers so
// the edge cases (exactly 1.25 and exactly 0.8) never depend on floating point rounding.
const OVER_NUMERATOR = 5
const OVER_DENOMINATOR = 4

/**
 * @param {unknown} row
 * @param {number} position
 * @returns {MatrixRow}
 */
function checkedRow(row, position) {
  if (typeof row !== 'object' || row === null) throw new TypeError(`Row ${position} must be an object.`)
  const { id, label, exposure, events } = /** @type {Record<string, unknown>} */ (row)
  if (typeof id !== 'string' || id === '') throw new TypeError(`Row ${position} needs a non-empty string id.`)
  if (typeof label !== 'string') throw new TypeError(`Row ${position} needs a string label.`)
  if (!Number.isSafeInteger(exposure) || /** @type {number} */ (exposure) < 0) {
    throw new TypeError(`Row ${position} exposure must be a non-negative integer.`)
  }
  if (!Number.isSafeInteger(events) || /** @type {number} */ (events) < 0) {
    throw new TypeError(`Row ${position} events must be a non-negative integer.`)
  }
  return { id, label, exposure: /** @type {number} */ (exposure), events: /** @type {number} */ (events) }
}

/**
 * The disproportionality matrix of one dossier. For every row (a play mode) it compares the share
 * of the player's fair-play flags with the share of the player's matches:
 * `index = (events * totalExposure) / (exposure * totalEvents)`. An index of 1 is proportional.
 * Pure: it is called during render, and the shares and the verdict are never stored.
 *
 * A row is `insufficient` (index `null`) when it has no matches or when the total number of flags
 * is below `MIN_TOTAL_EVENTS`.
 * @param {readonly MatrixRow[]} rows
 * @returns {readonly MatrixCell[]}   In the order of `rows`.
 * @throws {TypeError} When `rows` is not an array, an id repeats, or a count is not a non-negative integer.
 */
export function computeMatrix(rows) {
  if (!Array.isArray(rows)) throw new TypeError('rows must be an array.')
  const checked = rows.map(checkedRow)
  if (new Set(checked.map((row) => row.id)).size !== checked.length) throw new TypeError('Row ids must be unique.')

  const totalExposure = checked.reduce((sum, row) => sum + row.exposure, 0)
  const totalEvents = checked.reduce((sum, row) => sum + row.events, 0)
  if (!Number.isSafeInteger(totalExposure) || !Number.isSafeInteger(totalEvents)) {
    throw new TypeError('The totals are too large to compare exactly.')
  }

  return Object.freeze(
    checked.map((row) => {
      const exposureShare = totalExposure === 0 ? 0 : row.exposure / totalExposure
      const eventShare = totalEvents === 0 ? 0 : row.events / totalEvents
      const judged = row.exposure > 0 && totalEvents >= MIN_TOTAL_EVENTS
      if (!judged) {
        return Object.freeze({ ...row, exposureShare, eventShare, index: null, verdict: 'insufficient' })
      }

      const observed = row.events * totalExposure
      const expected = row.exposure * totalEvents
      if (!Number.isSafeInteger(observed) || !Number.isSafeInteger(expected)) {
        throw new TypeError('The counts are too large to compare exactly.')
      }
      const verdict =
        observed * OVER_DENOMINATOR > expected * OVER_NUMERATOR
          ? 'over'
          : observed * OVER_NUMERATOR < expected * OVER_DENOMINATOR
            ? 'under'
            : 'proportional'
      return Object.freeze({ ...row, exposureShare, eventShare, index: observed / expected, verdict })
    }),
  )
}
