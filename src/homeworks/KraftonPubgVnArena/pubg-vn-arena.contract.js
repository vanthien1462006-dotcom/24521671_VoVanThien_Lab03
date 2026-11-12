/**
 * @typedef {'WARMUP' | 'AIRDROP_LIVE' | 'LOOTED_OUT' | 'EXPIRED'} DropPhase
 */

/**
 * @typedef {Object} PubgCrateDrop
 * @property {string} id
 * @property {string} title           For example 'PVS Finals VIP Pass + 5,000 G-Coin'.
 * @property {number} priceVnd        Formatted with Intl.NumberFormat('vi-VN').
 * @property {number} remainingStock
 * @property {number} dropEpochMs
 */

/**
 * @typedef {'te' | 'ces' | 'ge' | 'agg'} PubgVnSquadId
 */

/**
 * @typedef {Object} PubgVnSquadStanding
 * @property {PubgVnSquadId} squadId
 * @property {string} squadName
 * @property {number} wwcdCount       Winner Winner Chicken Dinner count.
 * @property {number} placementPts
 * @property {number} killPts
 */

/**
 * @typedef {'wwcd' | 'placement' | 'kills' | 'total'} StandingSortKey
 */

/**
 * @typedef {Object} KillFeedEvent
 * @property {string} id
 * @property {PubgVnSquadId} killerSquadId
 * @property {PubgVnSquadId} victimSquadId
 * @property {string} weapon
 */

/**
 * @typedef {Object} ClaimResponse
 * @property {200 | 409} status
 * @property {number} remainingStock  Server stock after the request.
 * @property {string} [error]         'Looted Out' when status is 409.
 */

/**
 * @typedef {Object} ArenaState
 * @property {Readonly<Record<string, number>>} stock     Crate id to displayed stock.
 * @property {Readonly<Record<string, string>>} pending   Crate id to in-flight claimId.
 * @property {Readonly<Record<string, number>>} owned     Crate id to confirmed claims.
 * @property {string | null} lastError
 */

export {};
