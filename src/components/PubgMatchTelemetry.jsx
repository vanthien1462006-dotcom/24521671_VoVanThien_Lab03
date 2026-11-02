import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { PUBG_VN_SQUADS } from '../data/pubgVnSquads.js'
import { fetchKraftonPubgTelemetry, isKnownSquadId } from '../utils/fetchKraftonPubgTelemetry.js'
import { IDLE_VIEW, loadingView, successView, errorView } from '../utils/telemetryView.js'
import styles from './PubgMatchTelemetry.module.css'

/** @param {import('../contracts/pubg-match-telemetry.contract.js').PubgMatchTelemetryProps} props */
export function PubgMatchTelemetry({ initialSquadId = 'te' }) {
  const headingId = useId()
  const [squadId, setSquadId] = useState(() => (isKnownSquadId(initialSquadId) ? initialSquadId : 'te'))
  const [view, setView] = useState(IDLE_VIEW)
  const [retryTick, setRetryTick] = useState(0)
  const selectedSquadRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    setView(loadingView())
    fetchKraftonPubgTelemetry(squadId, { signal: controller.signal })
      .then((payload) => setView(successView(payload)))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setView(errorView(err.message))
      })
    return () => controller.abort()
  }, [squadId, retryTick])

  function handleReconnect() {
    setRetryTick((t) => t + 1)
    selectedSquadRef.current?.focus()
  }

  return (
    <section className={styles.telemetry} aria-labelledby={headingId}>
      <h2 id={headingId}>KRAFTON PUBG VN Live Telemetry</h2>
      <ul className={styles.squads} aria-label="Squads">
        {PUBG_VN_SQUADS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              aria-pressed={s.id === squadId}
              ref={s.id === squadId ? selectedSquadRef : undefined}
              onClick={() => setSquadId(s.id)}
            >
              {s.name}
            </button>
          </li>
        ))}
      </ul>
      <TelemetryPanel view={view} onReconnect={handleReconnect} />
    </section>
  )
}

/**
 * @param {{ view: import('../contracts/pubg-match-telemetry.contract.js').TelemetryView, onReconnect: () => void }} props
 */
function TelemetryPanel({ view, onReconnect }) {
  if (view.status === 'LOADING') {
    return (
      <section className={styles.skeleton} aria-busy="true">
        Syncing KRAFTON Radar...
      </section>
    )
  }
  if (view.status === 'ERROR') {
    return (
      <section className={styles.alert} role="alert">
        <p>Blue-Zone Link Lost: {view.error}</p>
        <button type="button" onClick={onReconnect}>
          Reconnect Satellite
        </button>
      </section>
    )
  }
  if (view.status === 'SUCCESS') {
    return (
      <article className={styles.result} aria-live="polite">
        <h3>{view.data.name}</h3>
        <dl>
          {Object.entries({
            Map: view.data.map,
            Phase: view.data.phase,
            Alive: view.data.alive,
            Kills: view.data.kills,
            'WWCD chance': view.data.wwcdProb,
            Status: view.data.status,
          }).map(([label, value]) => (
            <Fragment key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </Fragment>
          ))}
        </dl>
      </article>
    )
  }
  return <p className={styles.panel}>Radar idle.</p>
}
