import { Link } from 'react-router'
import styles from './PhotoGrid.module.css'

/** @typedef {import('./gallery.contract.js').Photo} Photo */

/**
 * Thumbnail grid. Opening a photo is a URL change, so every card is a link. The visible title is
 * the link's accessible name, so the thumbnail is decorative (empty alt); the full description
 * is the alt text of the lightbox image.
 * @param {{
 *   photos: readonly Photo[],
 *   searchFor: (photoId: string) => string,
 *   onOpen: (opener: HTMLElement) => void,
 * }} props   `searchFor` gives the query string that opens one photo; `onOpen` receives the clicked link.
 */
export function PhotoGrid({ photos, searchFor, onOpen }) {
  return (
    <ul className={styles.grid} aria-label="Photos">
      {photos.map((photo) => (
        <li key={photo.id}>
          <Link className={styles.card} to={{ search: searchFor(photo.id) }} onClick={(event) => onOpen(event.currentTarget)}>
            <figure className={styles.figure}>
              <img className={styles.thumb} src={photo.src} alt="" width={photo.width} height={photo.height} decoding="async" />
              <figcaption className={styles.caption}>{photo.title}</figcaption>
            </figure>
          </Link>
        </li>
      ))}
    </ul>
  )
}
