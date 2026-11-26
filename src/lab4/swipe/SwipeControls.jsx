import styles from './SwipeControls.module.css'

/** @typedef {import('./swipe.contract.js').SwipeAction} SwipeAction */

/**
 * Buttons for every swipe action. Dragging is not the only way to swipe (WCAG 2.5.7): each action
 * also has a button, and the keyboard keys are written next to it.
 * @param {{
 *   canSwipe: boolean,
 *   canUndo: boolean,
 *   disabled: boolean,
 *   onSwipe: (action: SwipeAction) => void,
 *   onUndo: () => void,
 *   onReset: () => void,
 * }} props
 */
export function SwipeControls({ canSwipe, canUndo, disabled, onSwipe, onUndo, onReset }) {
  return (
    <menu className={styles.controls} aria-label="Swipe actions">
      <li>
        <button type="button" className={styles.button} disabled={disabled || !canSwipe} onClick={() => onSwipe('NOPE')}>
          Nope <kbd>Left arrow</kbd>
        </button>
      </li>
      <li>
        <button type="button" className={styles.button} disabled={disabled || !canSwipe} onClick={() => onSwipe('SUPERLIKE')}>
          Super like <kbd>Up arrow</kbd>
        </button>
      </li>
      <li>
        <button type="button" className={styles.button} disabled={disabled || !canSwipe} onClick={() => onSwipe('LIKE')}>
          Like <kbd>Right arrow</kbd>
        </button>
      </li>
      <li>
        <button type="button" className={styles.button} disabled={disabled || !canUndo} onClick={onUndo}>
          Undo <kbd>Backspace</kbd>
        </button>
      </li>
      <li>
        <button type="button" className={styles.button} disabled={disabled || !canUndo} onClick={onReset}>
          Start over
        </button>
      </li>
    </menu>
  )
}
