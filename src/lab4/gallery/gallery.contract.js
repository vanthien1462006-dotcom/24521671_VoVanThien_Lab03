/**
 * @typedef {'screenshots' | 'chat-logs' | 'replays' | 'reports'} PhotoCategoryId
 */

/**
 * @typedef {Object} PhotoCategory
 * @property {PhotoCategoryId} id
 * @property {string} label   Visible name, for example 'Chat logs'.
 */

/**
 * @typedef {Object} Photo
 * @property {string} id           Stable id, also the `photoId` URL parameter.
 * @property {string} title        Visible name; it is the accessible name of the thumbnail link.
 * @property {PhotoCategoryId} category
 * @property {string} src          Same-origin path under /gallery/.
 * @property {number} width        Intrinsic width in pixels (no layout shift).
 * @property {number} height       Intrinsic height in pixels.
 * @property {string} alt          Describes the image in the lightbox.
 * @property {string} caption      Context line shown under the lightbox image.
 * @property {string} capturedOn   ISO date, YYYY-MM-DD.
 * @property {string} source       Where the item came from.
 */

/**
 * The gallery state that lives in the URL query string.
 * @typedef {Object} GalleryParams
 * @property {PhotoCategoryId | 'all'} category   `all` when the parameter is absent or unknown.
 * @property {string | null} photoId              Raw id from the URL, or null. It is not checked against the data here.
 */

export {}
