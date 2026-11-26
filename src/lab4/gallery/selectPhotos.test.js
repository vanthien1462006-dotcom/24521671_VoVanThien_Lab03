import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PHOTOS } from './photos.js'
import { findPhotoById, selectPhotosByCategory } from './selectPhotos.js'

test('category "all" returns every photo in data order', () => {
  assert.deepEqual(selectPhotosByCategory(PHOTOS, 'all').map((p) => p.id), PHOTOS.map((p) => p.id))
})

test('a category returns only its photos', () => {
  const replays = selectPhotosByCategory(PHOTOS, 'replays')
  assert.ok(replays.length > 0)
  for (const photo of replays) assert.equal(photo.category, 'replays')
})

test('an unknown category returns an empty list', () => {
  assert.deepEqual(selectPhotosByCategory(PHOTOS, 'nope'), [])
})

test('selection never mutates its input and returns a new array', () => {
  const input = [...PHOTOS]
  const result = selectPhotosByCategory(input, 'all')
  assert.notEqual(result, input)
  assert.deepEqual(input, [...PHOTOS])
})

test('findPhotoById returns the photo with that exact id', () => {
  assert.equal(findPhotoById(PHOTOS, 'ph-3'), PHOTOS.find((p) => p.id === 'ph-3'))
})

test('findPhotoById returns null for an unknown id', () => {
  assert.equal(findPhotoById(PHOTOS, 'ph-999'), null)
  assert.equal(findPhotoById(PHOTOS, 'PH-3'), null)
})

test('findPhotoById returns null for a non-string id', () => {
  for (const id of [null, undefined, 3, {}, ['ph-3']]) assert.equal(findPhotoById(PHOTOS, id), null)
})

test('findPhotoById does not match prototype names', () => {
  assert.equal(findPhotoById(PHOTOS, 'constructor'), null)
  assert.equal(findPhotoById(PHOTOS, '__proto__'), null)
})
