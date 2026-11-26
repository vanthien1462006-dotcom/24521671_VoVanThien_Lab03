import { Fragment, useEffect, useId, useRef } from 'react'
import { CATEGORIES } from './photos.js'
import styles from './PhotoLightbox.module.css'

/** @typedef {import('./gallery.contract.js').Photo} Photo */

/**
 * Lightbox on the native <dialog> element. The URL decides which photo is open: when `photo`
 * is not null the dialog is opened as a modal (focus trap, inert page, Escape, top layer),
 * and when it becomes null the dialog is closed. That is the only effect, and it only calls
 * the dialog through a ref: it starts no timer or listener and sets no state.
 *
 * `onClose` runs on every `close` event: Escape, the Close button, a backdrop click, or the
 * effect closing it after the URL changed (browser Back).
 * @param {{ photo: Photo | null, onClose: () => void }} props
 */
export function PhotoLightbox({ photo, onClose }) {
  const titleId = useId()
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    if (photo !== null && !dialog.open) dialog.showModal()
    else if (photo === null && dialog.open) dialog.close()
  }, [photo])

  function handleBackdropClick(event) {
    // A click on the backdrop targets the dialog element itself; clicks inside land on the article.
    if (event.target === event.currentTarget) event.currentTarget.close()
  }

  const categoryLabel = photo === null ? '' : (CATEGORIES.find((c) => c.id === photo.category)?.label ?? photo.category)
  const details =
    photo === null ? [] : Object.entries({ Category: categoryLabel, Captured: photo.capturedOn, Source: photo.source })

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={photo === null ? undefined : titleId}
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      {photo !== null && (
        <article className={styles.panel}>
          <header className={styles.header}>
            <h3 id={titleId} className={styles.title}>
              {photo.title}
            </h3>
            <button type="button" className={styles.close} onClick={() => dialogRef.current?.close()}>
              Close
            </button>
          </header>
          <figure className={styles.figure}>
            <img className={styles.image} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
            <figcaption>{photo.caption}</figcaption>
          </figure>
          <dl className={styles.meta}>
            {details.map(([term, value]) => (
              <Fragment key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </Fragment>
            ))}
          </dl>
        </article>
      )}
    </dialog>
  )
}
