import { useCallback, useEffect, useId, useReducer, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  SAMPLE_DATA_NOTICE,
  SQUAD_STANDINGS,
  buildSampleCrates,
  buildServerStock,
} from './arenaData.js'
import { arenaReducer, createArenaState } from './arenaReducer.js'
import { SAMPLE_KILL_FEED, filterKillFeed } from './killFeed.js'
import { createMockArenaServer } from './mockArenaServer.js'
import { SORT_OPTIONS, selectStandings } from './standings.js'
import { CrateCard } from './CrateCard.jsx'
import { KillFeed } from './KillFeed.jsx'
import { Leaderboard } from './Leaderboard.jsx'
import styles from './KraftonPubgVnArena.module.css'

/**
 * Composes the arena and wires optimistic claims.
 * A claim updates the UI at once, then the mock server answers; a 409 rolls the claim back.
 * Every pending request has an AbortController, and unmount aborts all of them.
 */
export function KraftonPubgVnArena() {
  const headingId = useId()
  const dropsId = useId()
  const squadSelectId = useId()
  const sortSelectId = useId()
  const dropsHeadingRef = useRef(null)
  const [squadFilter, setSquadFilter] = useState('all')
  const [sortBy, setSortBy] = useState('wwcd')
  const [crates] = useState(() => buildSampleCrates(Date.now()))
  const [state, dispatch] = useReducer(arenaReducer, crates, createArenaState)
  const [server] = useState(() => createMockArenaServer({ serverStock: buildServerStock() }))
  const inFlightRef = useRef(new Map())

  useEffect(() => {
    const inFlight = inFlightRef.current
    return () => {
      for (const controller of inFlight.values()) controller.abort()
      inFlight.clear()
    }
  }, [])

  const handleClaim = useCallback(
    async (crateId) => {
      const inFlight = inFlightRef.current
      if (inFlight.has(crateId)) return
      const claimId = crypto.randomUUID()
      const controller = new AbortController()
      inFlight.set(crateId, controller)
      dispatch({ type: 'CLAIM_STARTED', crateId, claimId })
      try {
        const res = await server.claimCrate(crateId, claimId, { signal: controller.signal })
        if (res.status === 200) {
          dispatch({ type: 'CLAIM_CONFIRMED', crateId, claimId, remainingStock: res.remainingStock })
        } else {
          dispatch({
            type: 'CLAIM_REJECTED',
            crateId,
            claimId,
            remainingStock: res.remainingStock,
            error: `${res.error}: your claim was rolled back.`,
          })
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        dispatch({
          type: 'CLAIM_REJECTED',
          crateId,
          claimId,
          error: 'Claim failed: your claim was rolled back.',
        })
      } finally {
        inFlight.delete(crateId)
      }
    },
    [server],
  )

  // The Dismiss button disappears with the message, so focus moves to the Airdrops heading here.
  const handleDismiss = () => {
    flushSync(() => dispatch({ type: 'DISMISS_ERROR' }))
    dropsHeadingRef.current?.focus()
  }

  const rows = selectStandings(SQUAD_STANDINGS, { squadId: squadFilter, sortBy })
  const events = filterKillFeed(SAMPLE_KILL_FEED, squadFilter)

  return (
    <section className={styles.arena} aria-labelledby={headingId}>
      <h2 id={headingId}>HW3 KRAFTON x PUBG Vietnam Airdrop Arena</h2>
      <p className={styles.notice}>
        <strong>{SAMPLE_DATA_NOTICE}</strong>
      </p>
      <section aria-labelledby={dropsId}>
        <h3 id={dropsId} ref={dropsHeadingRef} tabIndex={-1}>
          Airdrops
        </h3>
        {state.lastError && (
          <p className={styles.alert} role="alert">
            {state.lastError}{' '}
            <button type="button" onClick={handleDismiss}>
              Dismiss
            </button>
          </p>
        )}
        <ul className={styles.crates}>
          {crates.map((crate) => (
            <li key={crate.id}>
              <CrateCard
                crate={crate}
                stock={state.stock[crate.id]}
                isPending={Boolean(state.pending[crate.id])}
                ownedCount={state.owned[crate.id] ?? 0}
                onClaim={handleClaim}
              />
            </li>
          ))}
        </ul>
      </section>
      <form role="search" className={styles.filters} onSubmit={(e) => e.preventDefault()}>
        <p>
          <label htmlFor={squadSelectId}>Squad</label>
          <select id={squadSelectId} value={squadFilter} onChange={(e) => setSquadFilter(e.target.value)}>
            <option value="all">All squads</option>
            {SQUAD_STANDINGS.map((s) => (
              <option key={s.squadId} value={s.squadId}>
                {s.squadName}
              </option>
            ))}
          </select>
        </p>
        <p>
          <label htmlFor={sortSelectId}>Sort leaderboard by</label>
          <select id={sortSelectId} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </p>
      </form>
      <Leaderboard rows={rows} sortBy={sortBy} />
      <KillFeed events={events} total={SAMPLE_KILL_FEED.length} />
    </section>
  )
}
