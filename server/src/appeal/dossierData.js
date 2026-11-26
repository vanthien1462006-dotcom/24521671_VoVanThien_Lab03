/** @typedef {import('./appeal.contract.js').DossierRecord} DossierRecord */

const mode = (id, label, matches, flags) => Object.freeze({ id, label, matches, flags })

/**
 * Sample dossiers for the Fair-Play Appeal Tribunal. EVERYTHING here is invented for the lab: the
 * handles are reused from the earlier labs only as names, and the match and flag counts, the case
 * ids and the summaries describe no real player or real review.
 * @type {readonly DossierRecord[]}
 */
export const DOSSIERS = Object.freeze([
  Object.freeze({
    playerId: 'himass',
    handle: 'Himass',
    team: 'Sample Squad',
    caseId: 'FP-2026-001',
    summary: 'Sample case: flags follow the matches played, and the squad index sits exactly on the 1.25 limit.',
    slaHours: 72,
    modes: Object.freeze([mode('solo', 'Solo', 30, 3), mode('duo', 'Duo', 30, 3), mode('squad', 'Squad', 40, 6)]),
  }),
  Object.freeze({
    playerId: 'tanvuu',
    handle: 'TanVuu',
    team: 'Sample Squad',
    caseId: 'FP-2026-002',
    summary: 'Sample case: flags are concentrated in duo matches and rare in solo matches.',
    slaHours: 48,
    modes: Object.freeze([mode('solo', 'Solo', 20, 1), mode('duo', 'Duo', 30, 6), mode('squad', 'Squad', 50, 5)]),
  }),
])
