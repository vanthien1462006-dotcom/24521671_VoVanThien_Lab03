import { ALL_CATEGORY } from './photos.js'

/** @typedef {import('./gallery.contract.js').Photo} Photo */

/**
 * Photos of one category, in data order. The input is never mutated.
 * @param {readonly Photo[]} photos
 * @param {string} category   A category id, or 'all'.
 * @returns {Photo[]}
 */
export function selectPhotosByCategory(photos, category) {
  if (category === ALL_CATEGORY) return [...photos]
  return photos.filter((photo) => photo.category === category)
}

/**
 * Looks up the photo named by the `photoId` URL parameter. The id is untrusted URL input.
 * @param {readonly Photo[]} photos
 * @param {unknown} id
 * @returns {Photo | null}   null means "render the not-found state".
 */
export function findPhotoById(photos, id) {
  if (typeof id !== 'string') return null
  return photos.find((photo) => photo.id === id) ?? null
}
