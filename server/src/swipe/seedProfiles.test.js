import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Profile } from './Profile.js'
import { SEED_PROFILES } from './seedProfiles.js'

test('there are 8 frozen seed profiles', () => {
  assert.equal(SEED_PROFILES.length, 8)
  assert.ok(Object.isFrozen(SEED_PROFILES))
  for (const profile of SEED_PROFILES) assert.ok(Object.isFrozen(profile), profile._id)
})

test('every seed profile passes the Profile schema', () => {
  for (const profile of SEED_PROFILES) {
    assert.equal(new Profile(profile).validateSync(), undefined, profile._id)
  }
})

test('ids are unique and the order is 1 to 8 without gaps', () => {
  assert.equal(new Set(SEED_PROFILES.map((p) => p._id)).size, SEED_PROFILES.length)
  assert.deepEqual(SEED_PROFILES.map((p) => p.order), [1, 2, 3, 4, 5, 6, 7, 8])
})

test('everyone is an adult of 21 to 35, as the plan says', () => {
  for (const profile of SEED_PROFILES) assert.ok(profile.age >= 21 && profile.age <= 35, profile._id)
})

test('the seed contains no link or markup', () => {
  for (const profile of SEED_PROFILES) {
    assert.ok(!/https?:|<|>/.test(`${profile.name} ${profile.bio}`), profile._id)
  }
})
