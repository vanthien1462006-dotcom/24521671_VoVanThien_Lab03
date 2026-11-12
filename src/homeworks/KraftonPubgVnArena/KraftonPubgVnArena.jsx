import { useId, useState } from 'react'
import { SAMPLE_DATA_NOTICE, buildSampleCrates } from './arenaData.js'
import { createArenaState } from './arenaReducer.js'
import { CrateCard } from './CrateCard.jsx'
import styles from './KraftonPubgVnArena.module.css'

/** Composes the arena. The claim handler is not wired yet (H3-T17). */
export function KraftonPubgVnArena() {
  const headingId = useId()
  const dropsId = useId()
  const [crates] = useState(() => buildSampleCrates(Date.now()))
  const [state] = useState(() => createArenaState(crates))

  return (
    <section className={styles.arena} aria-labelledby={headingId}>
      <h2 id={headingId}>HW3 KRAFTON x PUBG Vietnam Airdrop Arena</h2>
      <p className={styles.notice}>
        <strong>{SAMPLE_DATA_NOTICE}</strong>
      </p>
      <section aria-labelledby={dropsId}>
        <h3 id={dropsId}>Airdrops</h3>
        <ul className={styles.crates}>
          {crates.map((crate) => (
            <li key={crate.id}>
              <CrateCard
                crate={crate}
                stock={state.stock[crate.id]}
                isPending={false}
                ownedCount={0}
                onClaim={() => {}}
              />
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}
