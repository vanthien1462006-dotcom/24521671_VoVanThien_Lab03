import { memo } from 'react'
import styles from './GrandPiano88.module.css'

/**
 * One piano key. Memoized: it re-renders only when its own props change, so the
 * parent must pass stable onNoteOn / onNoteOff and a boolean isPressed.
 * @param {import('./grand-piano.contract.js').PianoKeyProps} props
 */
export const PianoKey = memo(function PianoKey({
  midi,
  noteName,
  isBlack,
  isPressed,
  onNoteOn,
  onNoteOff,
}) {
  // Enter and Space activate a button; they are not letter shortcuts.
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      e.preventDefault()
      onNoteOn(midi)
    }
  }
  const handleKeyUp = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onNoteOff(midi)
    }
  }

  return (
    <button
      type="button"
      className={`${styles.key} ${isBlack ? styles.keyBlack : styles.keyWhite}`}
      aria-pressed={isPressed}
      onPointerDown={() => onNoteOn(midi)}
      onPointerUp={() => onNoteOff(midi)}
      onPointerLeave={() => onNoteOff(midi)}
      onPointerCancel={() => onNoteOff(midi)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <span>{noteName}</span>
    </button>
  )
})
