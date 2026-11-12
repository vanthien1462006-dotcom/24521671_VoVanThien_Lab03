import { useId } from 'react'
import { SQUAD_STANDINGS } from './arenaData.js'
import styles from './KraftonPubgVnArena.module.css'

/**
 * Squad standings table. The sorted column carries aria-sort.
 * The scroll container is focusable so keyboard users can scroll a wide table.
 * @param {{
 *   rows: ReadonlyArray<import('./pubg-vn-arena.contract.js').PubgVnSquadStanding & { totalPts: number }>,
 *   sortBy: import('./pubg-vn-arena.contract.js').StandingSortKey,
 * }} props
 */
export function Leaderboard({ rows, sortBy }) {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId}>Leaderboard</h3>
      <section className={styles.tableScroll} aria-label="Leaderboard table" tabIndex={0}>
        <table className={styles.table}>
          <caption>PVS Finals standings (sample data)</caption>
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Squad</th>
              <th scope="col" aria-sort={sortBy === 'wwcd' ? 'descending' : undefined}>
                WWCD
              </th>
              <th scope="col" aria-sort={sortBy === 'placement' ? 'descending' : undefined}>
                Placement pts
              </th>
              <th scope="col" aria-sort={sortBy === 'kills' ? 'descending' : undefined}>
                Kill pts
              </th>
              <th scope="col" aria-sort={sortBy === 'total' ? 'descending' : undefined}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.squadId}>
                <td>{i + 1}</td>
                <th scope="row">{row.squadName}</th>
                <td>{row.wwcdCount}</td>
                <td>{row.placementPts}</td>
                <td>{row.killPts}</td>
                <td>{row.totalPts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <output role="status" aria-live="polite">
        {rows.length} of {SQUAD_STANDINGS.length} squads
      </output>
    </section>
  )
}
