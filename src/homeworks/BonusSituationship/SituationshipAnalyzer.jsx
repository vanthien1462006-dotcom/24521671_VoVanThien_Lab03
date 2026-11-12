import { useEffect, useId, useState } from 'react'
import { delay } from '../GrandPiano88/replay.js'
import { computeImpacts, isRedFlag, sanitizeCount, transition } from './situationshipModel.js'
import styles from './SituationshipAnalyzer.module.css'

const GHOST_DELAY_MS = 5000

export function SituationshipAnalyzer() {
  const headingId = useId()
  const myId = useId()
  const rivalId = useId()
  const meterId = useId()
  const [phase, setPhase] = useState('DATING_NO_LOVE')
  const [myTries, setMyTries] = useState(100)
  const [rivalTries, setRivalTries] = useState(1)

  const { myImpact, rivalImpact, emShare } = computeImpacts(myTries, rivalTries)
  const redFlag = isRedFlag(phase, myImpact, rivalImpact)

  useEffect(() => {
    if (phase !== 'DATING_NO_LOVE') return undefined
    const controller = new AbortController()
    delay(GHOST_DELAY_MS, controller.signal)
      .then(() => setPhase((p) => transition(p, 'GHOST_TIMEOUT')))
      .catch((err) => {
        if (err.name !== 'AbortError') throw err
      })
    return () => controller.abort()
  }, [phase, myTries])

  return (
    <section className={styles.bonus} aria-labelledby={headingId}>
      <h2 id={headingId}>Bonus Exercise: Situationship FSM</h2>
      <article className={styles.analyzer} aria-label="Hẹn Hò Nhưng Không Yêu Analyzer" lang="vi">
        <p className={styles.phase}>
          Phase: <strong>{phase}</strong>
        </p>
        <output
          className={redFlag ? styles.redFlag : styles.stable}
          role="status"
          aria-live="polite"
        >
          {redFlag
            ? '[RED-FLAG] Red Flag: Hẹn hò nhưng không yêu — Giải phóng bộ nhớ!'
            : '[OK] Stable'}
        </output>
        <p className={styles.meterRow}>
          <label htmlFor={meterId}>
            <span lang="en">Em's share of effort impact</span>
          </label>{' '}
          <meter id={meterId} min={0} max={1} low={0.5} optimum={1} value={emShare} />{' '}
          <span lang="en">
            Em: {myImpact.toFixed(1)} · Ai đó: {rivalImpact.toFixed(1)}
          </span>
        </p>
        <p className={styles.field}>
          <label htmlFor={myId}>Em cố (số lần)</label>
          <input
            id={myId}
            type="number"
            min="0"
            step="1"
            value={myTries}
            onChange={(e) => setMyTries(sanitizeCount(e.target.valueAsNumber))}
          />
        </p>
        <p className={styles.field}>
          <label htmlFor={rivalId}>Ai đó (số phần)</label>
          <input
            id={rivalId}
            type="number"
            min="0"
            step="1"
            value={rivalTries}
            onChange={(e) => setRivalTries(sanitizeCount(e.target.valueAsNumber))}
          />
        </p>
      </article>
    </section>
  )
}
