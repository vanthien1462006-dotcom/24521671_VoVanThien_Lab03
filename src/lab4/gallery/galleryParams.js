import { ALL_CATEGORY, CATEGORIES } from './photos.js'

/** @typedef {import('./gallery.contract.js').GalleryParams} GalleryParams */

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id))
const MAX_PHOTO_ID_LENGTH = 64

/** @param {unknown} value */
function isUsablePhotoId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_PHOTO_ID_LENGTH
}

/**
 * Reads the gallery state from the URL query string. Every value is untrusted: an unknown
 * category becomes "all", and an empty or oversized photoId becomes null. Whether the photo
 * exists is decided later, by findPhotoById.
 * @param {URLSearchParams} searchParams
 * @returns {GalleryParams}
 */
export function parseGalleryParams(searchParams) {
  const category = searchParams.get('category')
  const photoId = searchParams.get('photoId')
  return {
    category: category !== null && CATEGORY_IDS.has(category) ? /** @type {GalleryParams['category']} */ (category) : ALL_CATEGORY,
    photoId: isUsablePhotoId(photoId) ? photoId : null,
  }
}

/**
 * Formats params for a router `to={{ search }}` value: '' when empty, else '?' plus the query.
 * @param {URLSearchParams} params
 * @returns {string}
 */
export function toSearchString(params) {
  const query = params.toString()
  return query === '' ? '' : `?${query}`
}

/**
 * Returns a new query string with the patch applied. Other keys are kept, and the input is never
 * mutated. `category: 'all'` (or an unknown id) removes the parameter; `photoId: null` removes
 * only photoId, so closing the lightbox keeps the category filter.
 * @param {URLSearchParams | string} current
 * @param {{ category?: string | null, photoId?: string | null }} patch
 * @returns {URLSearchParams}
 */
export function updateGalleryParams(current, patch) {
  const next = new URLSearchParams(current)
  if (Object.hasOwn(patch, 'category')) {
    const { category } = patch
    if (typeof category === 'string' && CATEGORY_IDS.has(category)) next.set('category', category)
    else next.delete('category')
  }
  if (Object.hasOwn(patch, 'photoId')) {
    const { photoId } = patch
    if (isUsablePhotoId(photoId)) next.set('photoId', /** @type {string} */ (photoId))
    else next.delete('photoId')
  }
  return next
}
