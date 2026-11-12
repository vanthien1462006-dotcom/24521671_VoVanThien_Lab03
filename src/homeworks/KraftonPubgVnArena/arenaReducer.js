/** @typedef {import('./pubg-vn-arena.contract.js').ArenaState} ArenaState */
/** @typedef {import('./pubg-vn-arena.contract.js').PubgCrateDrop} PubgCrateDrop */

/**
 * @param {ReadonlyArray<PubgCrateDrop>} crates
 * @returns {ArenaState}
 */
export function createArenaState(crates) {
  return {
    stock: Object.fromEntries(crates.map((crate) => [crate.id, crate.remainingStock])),
    pending: {},
    owned: {},
    lastError: null,
  }
}

/**
 * Pure reducer for optimistic claims. It never mutates the state it receives.
 * An action that changes nothing returns the same state object.
 * @param {ArenaState} state
 * @param {{ type: string, crateId?: string, claimId?: string, remainingStock?: number }} action
 * @returns {ArenaState}
 */
export function arenaReducer(state, action) {
  switch (action.type) {
    case 'CLAIM_STARTED': {
      const { crateId, claimId } = action
      if (state.pending[crateId] || (state.stock[crateId] ?? 0) <= 0) return state
      return {
        ...state,
        stock: { ...state.stock, [crateId]: state.stock[crateId] - 1 },
        pending: { ...state.pending, [crateId]: claimId },
        lastError: null,
      }
    }
    case 'CLAIM_CONFIRMED': {
      const { crateId, claimId, remainingStock } = action
      if (state.pending[crateId] !== claimId) return state
      return {
        ...state,
        stock: { ...state.stock, [crateId]: remainingStock },
        pending: Object.fromEntries(Object.entries(state.pending).filter(([id]) => id !== crateId)),
        owned: { ...state.owned, [crateId]: (state.owned[crateId] ?? 0) + 1 },
      }
    }
    case 'CLAIM_REJECTED': {
      const { crateId, claimId, remainingStock, error } = action
      if (state.pending[crateId] !== claimId) return state
      const restored = state.stock[crateId] + 1
      return {
        ...state,
        stock: { ...state.stock, [crateId]: Number.isFinite(remainingStock) ? remainingStock : restored },
        pending: Object.fromEntries(Object.entries(state.pending).filter(([id]) => id !== crateId)),
        lastError: error ?? 'Claim failed',
      }
    }
    case 'CLAIM_ABORTED': {
      const { crateId, claimId } = action
      if (state.pending[crateId] !== claimId) return state
      return {
        ...state,
        stock: { ...state.stock, [crateId]: state.stock[crateId] + 1 },
        pending: Object.fromEntries(Object.entries(state.pending).filter(([id]) => id !== crateId)),
      }
    }
    case 'DISMISS_ERROR':
      if (state.lastError === null) return state
      return { ...state, lastError: null }
    default:
      throw new TypeError(`Unknown action: ${action.type}`)
  }
}
