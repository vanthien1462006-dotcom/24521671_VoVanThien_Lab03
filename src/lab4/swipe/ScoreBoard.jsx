import styles from './ScoreBoard.module.css'

/** @typedef {import('./swipe.contract.js').SwipeAction} SwipeAction */

/**
 * The score and the counts, derived from the history by the caller. It is an `output` that is not
 * live: the result of each action is announced once, by the deck's own status line.
 * @param {{ score: number, stats: Record<SwipeAction, number>, total: number }} props
 */
export function ScoreBoard({ score, stats, total }) {
  const done = stats.LIKE + stats.NOPE + stats.SUPERLIKE
  return (
    <output className={styles.board} aria-live="off">
      <strong className={styles.score}>Score {score}</strong>
      <span>
        Card {Math.min(done + 1, total)} of {total}
      </span>
      <span>
        {stats.LIKE} liked, {stats.SUPERLIKE} super liked, {stats.NOPE} passed
      </span>
    </output>
  )
}
