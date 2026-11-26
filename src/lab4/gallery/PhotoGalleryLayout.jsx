import { useId, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CategoryFilter } from './CategoryFilter.jsx'
import { parseGalleryParams, toSearchString, updateGalleryParams } from './galleryParams.js'
import { PhotoGrid } from './PhotoGrid.jsx'
import { PhotoLightbox } from './PhotoLightbox.jsx'
import { ALL_CATEGORY, CATEGORIES } from './photos.js'
import { findPhotoById, selectPhotosByCategory } from './selectPhotos.js'
import styles from './PhotoGalleryLayout.module.css'

/** @typedef {import('./gallery.contract.js').Photo} Photo */

/**
 * Photo & Evidence Gallery. The URL is the state: `category` filters the grid and `photoId`
 * opens the lightbox, so every view can be shared as a link and Back closes the lightbox.
 * Both parameters are untrusted. The visible photos and the selected photo are derived during
 * render; the only state is the URL, and the only effect is inside PhotoLightbox.
 * @param {{ photos: readonly Photo[] }} props
 */
export function PhotoGalleryLayout({ photos }) {
  const headingId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const openerRef = useRef(null)

  const { category, photoId } = parseGalleryParams(searchParams)
  const visiblePhotos = selectPhotosByCategory(photos, category)
  const selectedPhoto = photoId === null ? null : findPhotoById(photos, photoId)
  const isPhotoMissing = photoId !== null && selectedPhoto === null
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label

  function handleCategoryChange(nextCategory) {
    setSearchParams((previous) => updateGalleryParams(previous, { category: nextCategory }))
  }

  function searchFor(id) {
    return toSearchString(updateGalleryParams(searchParams, { photoId: id }))
  }

  function handleOpen(opener) {
    openerRef.current = opener
  }

  // Runs for every dialog `close` event. Only photoId is removed, so the category filter
  // survives (slide 29 clears every parameter). Focus goes back to the link that opened the photo.
  function handleClose() {
    if (searchParams.has('photoId')) {
      setSearchParams((previous) => updateGalleryParams(previous, { photoId: null }), { replace: true })
    }
    const opener = openerRef.current
    if (opener !== null && opener.isConnected) opener.focus()
  }

  return (
    <section className={styles.gallery} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        Photo &amp; Evidence Gallery
      </h2>
      <p className={styles.notice}>Sample images, not real evidence. Every view has its own link: share the address bar.</p>
      <CategoryFilter categories={CATEGORIES} value={category} onChange={handleCategoryChange} />
      <output className={styles.status} role="status" aria-live="polite">
        {category === ALL_CATEGORY
          ? `Showing all ${visiblePhotos.length} photos.`
          : `Showing ${visiblePhotos.length} of ${photos.length} photos in ${categoryLabel}.`}
      </output>
      {isPhotoMissing && (
        <p className={styles.missing} role="alert">
          404: Photo Not Found.{' '}
          <Link
            className={styles.missingLink}
            to={{ search: toSearchString(updateGalleryParams(searchParams, { photoId: null })) }}
            replace
          >
            Back to the gallery
          </Link>
        </p>
      )}
      <PhotoGrid photos={visiblePhotos} searchFor={searchFor} onOpen={handleOpen} />
      <PhotoLightbox photo={selectedPhoto} onClose={handleClose} />
    </section>
  )
}
