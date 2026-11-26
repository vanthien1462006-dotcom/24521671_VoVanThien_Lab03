import { useId } from 'react'
import { Link, useParams } from 'react-router'
import { AppealForm } from './AppealForm.jsx'
import { DisproportionalityMatrix } from './DisproportionalityMatrix.jsx'
import { SlaCountdown } from './SlaCountdown.jsx'
import { useAppealSlaTimer } from './useAppealSlaTimer.js'
import { useDossier } from './useDossier.js'
import styles from './DossierView.module.css'

/** @typedef {import('./appeal.contract.js').Dossier} Dossier */
/** @typedef {import('./appeal.contract.js').AppealReceipt} AppealReceipt */

/**
 * A loaded case. It is rendered with `key={playerId}`, so another case starts a new clock and an
 * empty form. The countdown decides what the appeal area shows: the form while the window is open,
 * the receipt once an appeal exists, otherwise a closed message.
 * @param {{ dossier: Dossier, appeal: AppealReceipt | null, offsetMs: number, onSubmitted: (receipt: AppealReceipt) => void }} props
 */
function DossierCase({ dossier, appeal, offsetMs, onSubmitted }) {
  const snapshot = useAppealSlaTimer({ deadlineIso: dossier.deadlineAt, initialOffsetMs: offsetMs })
  let appealArea
  if (appeal !== null) {
    appealArea = (
      <section className={styles.receipt} aria-label="Appeal receipt">
        <h3>Appeal received</h3>
        <p>
          Reference <strong>{appeal.id}</strong> for case {appeal.caseId}, submitted{' '}
          <time dateTime={appeal.submittedAt}>{new Date(appeal.submittedAt).toLocaleString()}</time>.
        </p>
      </section>
    )
  } else if (snapshot.expired) {
    appealArea = <p className={styles.closed}>The appeal window has closed. No appeal can be filed for this case.</p>
  } else {
    appealArea = <AppealForm playerId={dossier.playerId} onSubmitted={onSubmitted} />
  }

  return (
    <>
      <p className={styles.summary}>
        {dossier.team} · case {dossier.caseId}. {dossier.summary}
      </p>
      <SlaCountdown snapshot={snapshot} deadlineIso={dossier.deadlineAt} />
      <DisproportionalityMatrix modes={dossier.modes} />
      {appealArea}
    </>
  )
}

/**
 * The route element of `/dossier/:playerID`. The parameter is untrusted: the hook checks its shape
 * before any request, and an unknown case is a "not found" page, not an error.
 */
export function DossierView() {
  const { playerID } = useParams()
  const headingId = useId()
  const state = useDossier(playerID)

  if (state.status === 'loading') return <p className={styles.state}>Loading the case…</p>

  if (state.status === 'not-found') {
    return (
      <section className={styles.view} aria-labelledby={headingId}>
        <h2 id={headingId}>Case not found</h2>
        <p>There is no case with this id. Pick one from the list.</p>
        <Link to="/dossier">Back to the cases</Link>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <p className={styles.alert} role="alert">
        {state.error}{' '}
        <button type="button" className={styles.retry} onClick={state.retry}>
          Try again
        </button>
      </p>
    )
  }

  const dossier = /** @type {Dossier} */ (state.dossier)
  return (
    <section className={styles.view} aria-labelledby={headingId}>
      <h2 id={headingId}>{dossier.handle}</h2>
      <DossierCase key={dossier.playerId} dossier={dossier} appeal={state.appeal} offsetMs={state.offsetMs} onSubmitted={state.recordAppeal} />
    </section>
  )
}
