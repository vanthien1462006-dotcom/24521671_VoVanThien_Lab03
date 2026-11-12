import { delay } from '../GrandPiano88/replay.js'

/** @typedef {import('./pubg-vn-arena.contract.js').ClaimResponse} ClaimResponse */

/**
 * In-memory stand-in for the claim endpoint. It makes no network request.
 * Answers are remembered by claimId, so repeating a claimId is idempotent.
 * @param {{
 *   serverStock: Readonly<Record<string, number>>,
 *   latencyMs?: number,
 *   delay?: (ms: number, signal?: AbortSignal) => Promise<void>,
 * }} options
 */
export function createMockArenaServer({ serverStock, latencyMs = 800, delay: wait = delay }) {
  const stock = { ...serverStock }
  /** @type {Map<string, Readonly<ClaimResponse>>} */
  const answers = new Map()

  return {
    /**
     * @param {string} crateId
     * @param {string} claimId
     * @param {{ signal?: AbortSignal }} [options]
     * @returns {Promise<Readonly<ClaimResponse>>}
     */
    async claimCrate(crateId, claimId, { signal } = {}) {
      if (!(crateId in stock)) throw new TypeError(`Unknown crate: ${crateId}`)
      await wait(latencyMs, signal)
      if (answers.has(claimId)) return answers.get(claimId)
      const response =
        stock[crateId] > 0
          ? Object.freeze({ status: 200, remainingStock: --stock[crateId] })
          : Object.freeze({ status: 409, error: 'Looted Out', remainingStock: 0 })
      answers.set(claimId, response)
      return response
    },

    /** Test helper: the stock the server currently holds. */
    peekStock(crateId) {
      return stock[crateId]
    },
  }
}
