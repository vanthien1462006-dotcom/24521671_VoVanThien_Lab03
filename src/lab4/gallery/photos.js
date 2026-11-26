/** @typedef {import('./gallery.contract.js').Photo} Photo */
/** @typedef {import('./gallery.contract.js').PhotoCategory} PhotoCategory */

/** Category value that means "no filter". It is never one of the category ids. */
export const ALL_CATEGORY = 'all'

/** @type {readonly PhotoCategory[]} */
export const CATEGORIES = Object.freeze([
  Object.freeze({ id: 'screenshots', label: 'Screenshots' }),
  Object.freeze({ id: 'chat-logs', label: 'Chat logs' }),
  Object.freeze({ id: 'replays', label: 'Replays' }),
  Object.freeze({ id: 'reports', label: 'Reports' }),
])

/**
 * Sample data written for the exercise. The images are local illustrations in public/gallery/.
 * @type {readonly Photo[]}
 */
export const PHOTOS = Object.freeze([
  Object.freeze({
    id: 'ph-1',
    title: 'Lobby screenshot',
    category: 'screenshots',
    src: '/gallery/ph-1.svg',
    width: 640,
    height: 400,
    alt: 'Illustration of a game lobby window with a title bar and two lines of text.',
    caption: 'Pre-match lobby with all four squads ready.',
    capturedOn: '2026-10-03',
    source: 'Player capture',
  }),
  Object.freeze({
    id: 'ph-2',
    title: 'Scoreboard screenshot',
    category: 'screenshots',
    src: '/gallery/ph-2.svg',
    width: 640,
    height: 400,
    alt: 'Illustration of a scoreboard window with a header bar and rows of results.',
    caption: 'End-of-match scoreboard showing placement and kill points.',
    capturedOn: '2026-10-03',
    source: 'Tournament client',
  }),
  Object.freeze({
    id: 'ph-3',
    title: 'Match chat log',
    category: 'chat-logs',
    src: '/gallery/ph-3.svg',
    width: 640,
    height: 400,
    alt: 'Illustration of three chat bubbles of different lengths, alternating left and right.',
    caption: 'Text chat exported from the match lobby.',
    capturedOn: '2026-10-04',
    source: 'Chat export',
  }),
  Object.freeze({
    id: 'ph-4',
    title: 'Voice channel log',
    category: 'chat-logs',
    src: '/gallery/ph-4.svg',
    width: 640,
    height: 400,
    alt: 'Illustration of three message bubbles in purple tones.',
    caption: 'Join and leave events of the team voice channel.',
    capturedOn: '2026-10-04',
    source: 'Voice server log',
  }),
  Object.freeze({
    id: 'ph-5',
    title: 'Final circle replay',
    category: 'replays',
    src: '/gallery/ph-5.svg',
    width: 640,
    height: 400,
    alt: 'Illustration of a play button inside a circle on an orange background.',
    caption: 'Replay of the last safe zone, minutes 24 to 27.',
    capturedOn: '2026-10-05',
    source: 'Replay file',
  }),
  Object.freeze({
    id: 'ph-6',
    title: 'Kill cam replay',
    category: 'replays',
    src: '/gallery/ph-6.svg',
    width: 640,
    height: 400,
    alt: 'Illustration of a play button inside a circle on a red background.',
    caption: 'Kill cam of the disputed elimination.',
    capturedOn: '2026-10-05',
    source: 'Replay file',
  }),
  Object.freeze({
    id: 'ph-7',
    title: 'Anti-cheat report',
    category: 'reports',
    src: '/gallery/ph-7.svg',
    width: 640,
    height: 400,
    alt: 'Illustration of a document page with a heading line and short paragraphs.',
    caption: 'Automated review summary for the flagged account.',
    capturedOn: '2026-10-06',
    source: 'Review system',
  }),
  Object.freeze({
    id: 'ph-8',
    title: 'Player appeal form',
    category: 'reports',
    src: '/gallery/ph-8.svg',
    width: 640,
    height: 400,
    alt: 'Illustration of a form page with a heading line and short paragraphs on a green background.',
    caption: 'Appeal submitted by the player within the response window.',
    capturedOn: '2026-10-07',
    source: 'Appeal portal',
  }),
])
