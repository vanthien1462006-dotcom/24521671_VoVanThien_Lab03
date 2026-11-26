import crypto from 'node:crypto'

/** @typedef {import('./appeal.contract.js').AppealStore} AppealStore */
/** @typedef {import('./appeal.contract.js').DossierRecord} DossierRecord */
/** @typedef {import('./appeal.contract.js').AppealReceipt} AppealReceipt */

const HOUR_MS = 3_600_000

/**
 * The in-memory appeal store. The server owns the clock: the deadline of each case is its SLA
 * window counted from the moment the store was created, and the window is judged with the same
 * clock, never with a time sent by the client. Lookups go through a `Map`, so ids such as
 * `constructor` or `__proto__` are plain misses. Nothing of an appeal is kept except its receipt:
 * the free text and the email are validated and then dropped.
 * @param {{ dossiers: readonly DossierRecord[], now?: () => Date, makeId?: () => string }} options
 * @returns {AppealStore}
 */
export function createAppealStore({ dossiers, now = () => new Date(), makeId = () => crypto.randomUUID() }) {
  const createdMs = now().getTime()
  const records = new Map(dossiers.map((record) => [record.playerId, record]))
  const deadlines = new Map(dossiers.map((record) => [record.playerId, createdMs + record.slaHours * HOUR_MS]))
  /** @type {Map<string, AppealReceipt>} */
  const appeals = new Map()

  return {
    listDossiers() {
      return dossiers.map(({ playerId, handle, caseId }) => ({ playerId, handle, caseId }))
    },

    getDossier(playerId) {
      const record = records.get(playerId)
      if (record === undefined) return null
      const receipt = appeals.get(playerId)
      return {
        playerId: record.playerId,
        handle: record.handle,
        team: record.team,
        caseId: record.caseId,
        summary: record.summary,
        slaHours: record.slaHours,
        modes: record.modes.map((m) => ({ id: m.id, label: m.label, matches: m.matches, flags: m.flags })),
        deadlineAt: new Date(/** @type {number} */ (deadlines.get(playerId))).toISOString(),
        serverNow: now().toISOString(),
        appeal: receipt === undefined ? null : { ...receipt },
      }
    },

    submitAppeal(playerId, _input) {
      const record = records.get(playerId)
      if (record === undefined) return { failure: 'not-found' }
      if (appeals.has(playerId)) return { failure: 'duplicate' }
      const submittedAt = now()
      if (submittedAt.getTime() >= /** @type {number} */ (deadlines.get(playerId))) return { failure: 'closed' }
      const receipt = { id: makeId(), playerId, caseId: record.caseId, submittedAt: submittedAt.toISOString() }
      appeals.set(playerId, receipt)
      return { receipt: { ...receipt } }
    },

    now() {
      return now().toISOString()
    },
  }
}
