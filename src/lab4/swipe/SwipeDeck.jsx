import { useId, useRef } from 'react'
import { ProfileCard } from './ProfileCard.jsx'
import { ScoreBoard } from './ScoreBoard.jsx'
import { SwipeControls } from './SwipeControls.jsx'
import { classifySwipe, keyToCommand } from './swipeInput.js'
import { useSwipeDeck } from './useSwipeDeck.js'
import styles from './SwipeDeck.module.css'

/**
 * Card-Swipe Deck: "Hẹn Hò Nhưng Không Yêu". Keys and pointer handlers are props of one focusable
 * `section`, so there is no window listener and no effect for input. Keys are read with `e.code`
 * and a held key (`e.repeat`) is ignored. A drag starts on pointerdown, keeps its start point in a
 * ref (it never renders) and is decided on pointerup by `classifySwipe`. Every action also has a
 * button, so dragging is never the only way (WCAG 2.5.7).
 */
export function SwipeDeck() {
  const headingId = useId()
  const deck = useSwipeDeck()
  const dragStart = useRef(/** @type {{ x: number, y: number, id: number } | null} */ (null))

  const total = deck.profiles.length
  const finished = deck.status === 'ready' && deck.current === null && total > 0

  /** @param {import('react').KeyboardEvent<HTMLElement>} event */
  function handleKeyDown(event) {
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return
    const command = keyToCommand(event.code)
    if (command === null) return
    event.preventDefault()
    if (command === 'UNDO') deck.undo()
    else deck.swipe(command)
  }

  /** @param {import('react').PointerEvent<HTMLElement>} event */
  function handlePointerDown(event) {
    if (!event.isPrimary || event.button !== 0) return
    if (event.target instanceof Element && event.target.closest('button')) return
    dragStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // The pointer already ended: the gesture is simply ignored on pointerup.
    }
  }

  /** @param {import('react').PointerEvent<HTMLElement>} event */
  function handlePointerUp(event) {
    const start = dragStart.current
    if (start === null || start.id !== event.pointerId) return
    dragStart.current = null
    const action = classifySwipe(event.clientX - start.x, event.clientY - start.y)
    if (action !== null) deck.swipe(action)
  }

  function handlePointerCancel() {
    dragStart.current = null
  }

  return (
    <section className={styles.deck} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        <span lang="vi">Hẹn Hò Nhưng Không Yêu</span>
      </h2>
      <p className={styles.notice}>Sample profiles, all invented. Drag the card or use the keys: Left arrow passes, Right arrow likes, Up arrow super likes, Backspace undoes.</p>

      {deck.status === 'loading' ? <p className={styles.state}>Loading the deck…</p> : null}

      {deck.status === 'error' ? (
        <p className={styles.alert} role="alert">
          {deck.loadError}{' '}
          <button type="button" className={styles.retry} onClick={deck.retry}>
            Try again
          </button>
        </p>
      ) : null}

      {deck.status === 'ready' ? (
        <>
          <section
            className={styles.stage}
            tabIndex={0}
            aria-label="Swipe deck. Use the arrow keys to swipe and Backspace to undo."
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          >
            {deck.current !== null ? <ProfileCard profile={deck.current} /> : null}
            {total === 0 ? <p className={styles.state}>The deck is empty. Run the seed script, then reload.</p> : null}
            {finished ? <p className={styles.state}>No more cards. Undo the last swipe or start over.</p> : null}
          </section>

          <ScoreBoard score={deck.score} stats={deck.stats} total={total} />

          <SwipeControls
            canSwipe={deck.current !== null}
            canUndo={deck.history.length > 0}
            onSwipe={deck.swipe}
            onUndo={deck.undo}
            onReset={deck.reset}
          />
        </>
      ) : null}

      <output className={styles.status} role="status" aria-live="polite">
        {deck.announcement}
      </output>
      {deck.actionError === null ? null : (
        <p className={styles.alert} role="alert">
          {deck.actionError}
        </p>
      )}
    </section>
  )
}
