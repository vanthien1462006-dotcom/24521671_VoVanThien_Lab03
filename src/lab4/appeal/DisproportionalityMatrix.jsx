import { useId } from 'react'
import { MIN_TOTAL_EVENTS, OVER_THRESHOLD, UNDER_THRESHOLD, computeMatrix } from './disproportionality.js'
import styles from './DisproportionalityMatrix.module.css'

/** @typedef {import('./appeal.contract.js').ModeStat} ModeStat */

const VERDICT_TEXT = Object.freeze({
  over: 'Over-flagged',
  under: 'Under-flagged',
  proportional: 'Proportional',
  insufficient: 'Not enough data',
})

/** @param {number} share  0 to 1 */
const percent = (share) => `${(share * 100).toFixed(1)}%`

/**
 * The disproportionality matrix of a dossier: for each game mode, the share of the player's flags
 * divided by the share of the player's matches. The table is computed during render from the
 * dossier; nothing is stored. The verdict is always written as text next to the number, so it is
 * never carried by colour alone.
 * @param {{ modes: readonly ModeStat[] }} props
 */
export function DisproportionalityMatrix({ modes }) {
  const captionId = useId()
  const cells = computeMatrix(modes.map((mode) => ({ id: mode.id, label: mode.label, exposure: mode.matches, events: mode.flags })))

  return (
    <section className={styles.matrix} aria-labelledby={captionId}>
      <h3 id={captionId}>Disproportionality matrix</h3>
      <p className={styles.note}>
        Index = share of flags divided by share of matches. Over-flagged above {OVER_THRESHOLD}, under-flagged below {UNDER_THRESHOLD}. Needs at
        least {MIN_TOTAL_EVENTS} flags in total. Sample data.
      </p>
      <section className={styles.scroll} tabIndex={0} aria-label="Matrix table (scrolls sideways on a small screen)">
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Mode</th>
              <th scope="col">Matches</th>
              <th scope="col">Flags</th>
              <th scope="col">Share of matches</th>
              <th scope="col">Share of flags</th>
              <th scope="col">Index</th>
              <th scope="col">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {cells.map((cell) => (
              <tr key={cell.id} data-verdict={cell.verdict}>
                <th scope="row">{cell.label}</th>
                <td>{cell.exposure}</td>
                <td>{cell.events}</td>
                <td>{percent(cell.exposureShare)}</td>
                <td>{percent(cell.eventShare)}</td>
                <td>{cell.index === null ? 'n/a' : cell.index.toFixed(2)}</td>
                <td>{VERDICT_TEXT[cell.verdict]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  )
}
