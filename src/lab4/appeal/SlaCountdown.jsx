import { useId } from 'react'
import { formatRemaining } from './slaClock.js'
import styles from './SlaCountdown.module.css'

/**
 * The SLA countdown. The snapshot comes from the zero-drift clock (server deadline, server offset)
 * through `useAppealSlaTimer`, called by the parent so it can also react to `expired`. The timer
 * element is not a live region: announcing every second would flood a screen reader. Only the state
 * that matters is announced, in a separate status: the window has closed, or the clock could not be
 * re-synced.
 * @param {{ snapshot: Readonly<import('./appeal.contract.js').SlaSnapshot>, deadlineIso: string }} props
 */
export function SlaCountdown({ snapshot, deadlineIso }) {
  const labelId = useId()
  const totalHours = snapshot.days * 24 + snapshot.hours
  const duration = `PT${totalHours}H${snapshot.minutes}M${snapshot.seconds}S`

  return (
    <section className={styles.countdown} aria-labelledby={labelId}>
      <h3 id={labelId}>Time left to appeal</h3>
      <p className={styles.clock}>
        <time role="timer" dateTime={snapshot.expired ? 'PT0S' : duration}>
          {formatRemaining(snapshot)}
        </time>
      </p>
      <p className={styles.deadline}>
        Closes <time dateTime={deadlineIso}>{new Date(deadlineIso).toLocaleString()}</time> (server time)
      </p>
      <output className={styles.status} role="status" aria-live="polite">
        {snapshot.expired ? 'The appeal window has closed.' : (snapshot.syncError ?? '')}
      </output>
    </section>
  )
}
