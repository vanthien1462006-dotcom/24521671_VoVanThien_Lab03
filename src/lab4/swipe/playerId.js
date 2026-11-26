/** Local storage key of the anonymous player id. */
export const PLAYER_ID_KEY = 'lab4.swipe.playerId'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** @typedef {{ getItem: (key: string) => string | null, setItem: (key: string, value: string) => void }} KeyValueStorage */

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export function isPlayerId(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

/**
 * Reads the stored player id. Storage values are untrusted: anything that is not a UUID is
 * ignored. A missing or blocked storage (private window) gives null.
 * @param {KeyValueStorage | null | undefined} storage
 * @returns {string | null}
 */
export function readPlayerId(storage) {
  try {
    const stored = storage?.getItem(PLAYER_ID_KEY)
    return isPlayerId(stored) ? stored : null
  } catch {
    return null
  }
}

/**
 * Returns the stored player id, or creates one and stores it. Calling it twice with the same
 * storage returns the same id, so it is safe in a lazy state initializer (React StrictMode runs
 * initializers twice). When storage cannot be written the id lives only for this page load.
 * @param {KeyValueStorage | null | undefined} storage
 * @param {() => string} [makeId]
 * @returns {string}
 */
export function ensurePlayerId(storage, makeId = () => crypto.randomUUID()) {
  const existing = readPlayerId(storage)
  if (existing !== null) return existing
  const created = makeId()
  try {
    storage?.setItem(PLAYER_ID_KEY, created)
  } catch {
    // Storage is blocked: keep the id in memory only.
  }
  return created
}
