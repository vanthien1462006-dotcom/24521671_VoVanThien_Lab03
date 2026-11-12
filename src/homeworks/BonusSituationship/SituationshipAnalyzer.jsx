import { useId, useState } from 'react'
import { sanitizeCount } from './situationshipModel.js'
import styles from './SituationshipAnalyzer.module.css'

export function SituationshipAnalyzer() {
  const headingId = useId()
  const myId = useId()
  const rivalId = useId()
  const [phase] = useState('DATING_NO_LOVE')
  const [myTries, setMyTries] = useState(100)
  const [rivalTries, setRivalTries] = useState(1)

  return (
    <section className={styles.bonus} aria-labelledby={headingId}>
      <h2 id={headingId}>Bonus Exercise: Situationship FSM</h2>
      <article className={styles.analyzer} aria-label="Hẹn Hò Nhưng Không Yêu Analyzer" lang="vi">
        <p className={styles.phase}>
          Phase: <strong>{phase}</strong>
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
