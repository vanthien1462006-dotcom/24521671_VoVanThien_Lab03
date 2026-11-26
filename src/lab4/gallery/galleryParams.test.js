import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseGalleryParams, toSearchString, updateGalleryParams } from './galleryParams.js'

const params = (query) => new URLSearchParams(query)

test('an empty query gives category "all" and no photo', () => {
  assert.deepEqual(parseGalleryParams(params('')), { category: 'all', photoId: null })
})

test('a known category is returned as is', () => {
  assert.equal(parseGalleryParams(params('category=replays')).category, 'replays')
})

test('an unknown, empty or wrong-case category falls back to "all"', () => {
  assert.equal(parseGalleryParams(params('category=nope')).category, 'all')
  assert.equal(parseGalleryParams(params('category=')).category, 'all')
  assert.equal(parseGalleryParams(params('category=REPLAYS')).category, 'all')
})

test('"all" in the URL is the same as no category', () => {
  assert.equal(parseGalleryParams(params('category=all')).category, 'all')
})

test('a prototype name is not a category (no inherited lookups)', () => {
  assert.equal(parseGalleryParams(params('category=constructor')).category, 'all')
  assert.equal(parseGalleryParams(params('category=__proto__')).category, 'all')
})

test('photoId is returned raw when present and null when empty or absent', () => {
  assert.equal(parseGalleryParams(params('photoId=ph-3')).photoId, 'ph-3')
  assert.equal(parseGalleryParams(params('photoId=')).photoId, null)
  assert.equal(parseGalleryParams(params('category=replays')).photoId, null)
})

test('photoId longer than 64 characters is treated as absent', () => {
  assert.equal(parseGalleryParams(params(`photoId=${'a'.repeat(65)}`)).photoId, null)
  assert.equal(parseGalleryParams(params(`photoId=${'a'.repeat(64)}`)).photoId, 'a'.repeat(64))
})

test('with a repeated parameter the first value wins', () => {
  assert.equal(parseGalleryParams(params('category=replays&category=reports')).category, 'replays')
})

test('update sets a category and keeps other keys', () => {
  const next = updateGalleryParams(params('photoId=ph-1&x=1'), { category: 'reports' })
  assert.equal(next.get('category'), 'reports')
  assert.equal(next.get('photoId'), 'ph-1')
  assert.equal(next.get('x'), '1')
})

test('update with category "all" removes the category parameter', () => {
  const next = updateGalleryParams(params('category=replays&photoId=ph-5'), { category: 'all' })
  assert.equal(next.has('category'), false)
  assert.equal(next.get('photoId'), 'ph-5')
})

test('update sets photoId and keeps the category (slide 29 clears every parameter and would lose it)', () => {
  const next = updateGalleryParams(params('category=replays'), { photoId: 'ph-6' })
  assert.equal(next.get('category'), 'replays')
  assert.equal(next.get('photoId'), 'ph-6')
})

test('update with photoId null removes only photoId', () => {
  const next = updateGalleryParams(params('category=replays&photoId=ph-6'), { photoId: null })
  assert.equal(next.has('photoId'), false)
  assert.equal(next.get('category'), 'replays')
})

test('an empty patch keeps everything', () => {
  assert.equal(updateGalleryParams(params('category=replays&photoId=ph-6'), {}).toString(), 'category=replays&photoId=ph-6')
})

test('update returns a new object and never mutates its input', () => {
  const original = params('category=replays')
  const next = updateGalleryParams(original, { photoId: 'ph-1' })
  assert.notEqual(next, original)
  assert.equal(original.toString(), 'category=replays')
})

test('update ignores an unknown category instead of writing it to the URL', () => {
  const next = updateGalleryParams(params(''), { category: 'nope' })
  assert.equal(next.has('category'), false)
})

test('update accepts any URLSearchParams-like source (string, init object)', () => {
  assert.equal(updateGalleryParams('category=reports', { photoId: 'ph-7' }).toString(), 'category=reports&photoId=ph-7')
})

test('toSearchString gives an empty string for no parameters', () => {
  assert.equal(toSearchString(params('')), '')
})

test('toSearchString prefixes a non-empty query with a question mark', () => {
  assert.equal(toSearchString(params('category=replays&photoId=ph-5')), '?category=replays&photoId=ph-5')
})

test('toSearchString encodes unsafe characters', () => {
  assert.equal(toSearchString(updateGalleryParams('', { photoId: 'a&b' })), '?photoId=a%26b')
})
