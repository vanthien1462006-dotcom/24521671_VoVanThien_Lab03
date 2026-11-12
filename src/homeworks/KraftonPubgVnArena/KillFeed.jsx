import { useId } from 'react'
import { SQUAD_STANDINGS } from './arenaData.js'
import styles from './KraftonPubgVnArena.module.css'

const NAME_BY_ID = Object.fromEntries(SQUAD_STANDINGS.map((s) => [s.squadId, s.squadName]))

/**
 * Kill feed for the selected squad. Rows use content-visibility in CSS, so off-screen rows
 * skip layout and paint without any JavaScript windowing. The scroll container is focusable.
 * @param {{
 *   events: ReadonlyArray<import('./pubg-vn-arena.contract.js').KillFeedEvent>,
 *   total: number,
 * }} props
 */
export function KillFeed({ events, total }) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId}>Kill feed</h3>
      <output role="status" aria-live="polite">
        {events.length} of {total} events
      </output>
      <section className={styles.feedScroll} aria-label="Kill feed events" tabIndex={0}>
        <ol className={styles.feed}>
          {events.map((e) => (
            <li key={e.id} className={styles.feedRow}>
              {NAME_BY_ID[e.killerSquadId]} eliminated {NAME_BY_ID[e.victimSquadId]} with {e.weapon}
            </li>
          ))}
        </ol>
      </section>
    </section>
  )
}
