import styles from './SwipeControls.module.css'

/** @typedef {import('./swipe.contract.js').SwipeAction} SwipeAction */

/**
 * Buttons for every swipe action. Dragging is not the only way to swipe (WCAG 2.5.7): each action
 * also has a button, and the keyboard keys are written next to it.
 *
 * An unavailable action uses `aria-disabled`, not `disabled`: a `disabled` button that has focus
 * loses it (after the last card or the last undo the keyboard user would restart from the top of
 * the page). The click is ignored instead.
 * @param {{
 *   canSwipe: boolean,
 *   canUndo: boolean,
 *   onSwipe: (action: SwipeAction) => void,
 *   onUndo: () => void,
 *   onReset: () => void,
 * }} props
 */
export function SwipeControls({ canSwipe, canUndo, onSwipe, onUndo, onReset }) {
  /**
   * @param {boolean} available
   * @param {() => void} run
   */
  function guarded(available, run) {
    return () => {
      if (available) run()
    }
  }

  return (
    <menu className={styles.controls} aria-label="Swipe actions">
      <li>
        <button type="button" className={styles.button} aria-disabled={!canSwipe} onClick={guarded(canSwipe, () => onSwipe('NOPE'))}>
          Nope <kbd>Left arrow</kbd>
        </button>
      </li>
      <li>
        <button type="button" className={styles.button} aria-disabled={!canSwipe} onClick={guarded(canSwipe, () => onSwipe('SUPERLIKE'))}>
          Super like <kbd>Up arrow</kbd>
        </button>
      </li>
      <li>
        <button type="button" className={styles.button} aria-disabled={!canSwipe} onClick={guarded(canSwipe, () => onSwipe('LIKE'))}>
          Like <kbd>Right arrow</kbd>
        </button>
      </li>
      <li>
        <button type="button" className={styles.button} aria-disabled={!canUndo} onClick={guarded(canUndo, onUndo)}>
          Undo <kbd>Backspace</kbd>
        </button>
      </li>
      <li>
        <button type="button" className={styles.button} aria-disabled={!canUndo} onClick={guarded(canUndo, onReset)}>
          Start over
        </button>
      </li>
    </menu>
  )
}
