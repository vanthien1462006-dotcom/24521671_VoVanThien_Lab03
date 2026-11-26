import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ALL_CATEGORY, CATEGORIES, PHOTOS } from './photos.js'

const publicDir = fileURLToPath(new URL('../../../public', import.meta.url))

test('PHOTOS and CATEGORIES are frozen, with frozen entries', () => {
  assert.ok(Object.isFrozen(PHOTOS))
  assert.ok(Object.isFrozen(CATEGORIES))
  for (const photo of PHOTOS) assert.ok(Object.isFrozen(photo), photo.id)
  for (const category of CATEGORIES) assert.ok(Object.isFrozen(category), category.id)
})

test('there are 8 photos in 4 categories', () => {
  assert.equal(PHOTOS.length, 8)
  assert.equal(CATEGORIES.length, 4)
})

test('ALL_CATEGORY is "all" and is not one of the category ids', () => {
  assert.equal(ALL_CATEGORY, 'all')
  assert.ok(!CATEGORIES.some((c) => c.id === ALL_CATEGORY))
})

test('photo ids are unique and URL-safe', () => {
  const ids = PHOTOS.map((p) => p.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/)
})

test('every photo belongs to a known category and every category has a photo', () => {
  const known = new Set(CATEGORIES.map((c) => c.id))
  for (const photo of PHOTOS) assert.ok(known.has(photo.category), photo.id)
  for (const id of known) assert.ok(PHOTOS.some((p) => p.category === id), id)
})

test('every photo has non-empty text, a date and positive intrinsic size', () => {
  for (const photo of PHOTOS) {
    for (const key of ['title', 'alt', 'caption', 'source']) {
      assert.equal(typeof photo[key], 'string', `${photo.id}.${key}`)
      assert.ok(photo[key].trim().length > 0, `${photo.id}.${key}`)
    }
    assert.match(photo.capturedOn, /^\d{4}-\d{2}-\d{2}$/, photo.id)
    assert.ok(Number.isInteger(photo.width) && photo.width > 0, photo.id)
    assert.ok(Number.isInteger(photo.height) && photo.height > 0, photo.id)
  }
})

test('every src is a same-origin /gallery/ path with no scheme', () => {
  for (const photo of PHOTOS) assert.match(photo.src, /^\/gallery\/[a-z0-9-]+\.svg$/, photo.id)
})

test('every src file exists in public/ and its size matches width and height', () => {
  for (const photo of PHOTOS) {
    const file = `${publicDir}${photo.src}`
    assert.ok(existsSync(file), `${photo.src} is missing`)
    const svg = readFileSync(file, 'utf8')
    assert.match(svg, new RegExp(`width="${photo.width}"`), photo.id)
    assert.match(svg, new RegExp(`height="${photo.height}"`), photo.id)
  }
})

test('category labels are unique', () => {
  const labels = CATEGORIES.map((c) => c.label)
  assert.equal(new Set(labels).size, labels.length)
})
