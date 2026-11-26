import { useId } from 'react'
import { formatRemaining } from './slaClock.js'
import { useAppealSlaTimer } from './useAppealSlaTimer.js'
import styles from './SlaCountdown.module.css'

/**
 * The SLA countdown. The value comes from the zero-drift clock (server deadline, server offset),
 * and the timer element is not a live region: announcing every second would flood a screen reader.
 * Only the state that matters is announced, in a separate status: the window has closed, or the
 * clock could not be re-synced.
 *
 * Render this with `key={deadlineIso}` so a different case starts a new clock.
 * @param {{ deadlineIso: string, initialOffsetMs: number }} props
 */
export function SlaCountdown({ deadlineIso, initialOffsetMs }) {
  const labelId = useId()
  const snapshot = useAppealSlaTimer({ deadlineIso, initialOffsetMs })
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
