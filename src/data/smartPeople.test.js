import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SMART_PEOPLE } from './smartPeople.js'

test('has exactly six entries', () => {
  assert.equal(SMART_PEOPLE.length, 6)
})

test('every id matches sp-N and ids are unique', () => {
  const ids = SMART_PEOPLE.map((p) => p.id)
  for (const id of ids) {
    assert.match(id, /^sp-\d+$/)
  }
  assert.equal(new Set(ids).size, ids.length)
})

test('name is a non-empty string, age and iq are positive integers', () => {
  for (const p of SMART_PEOPLE) {
    assert.equal(typeof p.name, 'string')
    assert.ok(p.name.length > 0)
    assert.ok(Number.isInteger(p.age) && p.age > 0)
    assert.ok(Number.isInteger(p.iq) && p.iq > 0)
  }
})

test('the array and every entry are frozen', () => {
  assert.ok(Object.isFrozen(SMART_PEOPLE))
  for (const p of SMART_PEOPLE) {
    assert.ok(Object.isFrozen(p))
  }
})

test('the first entry is Johann Goethe', () => {
  assert.deepEqual(SMART_PEOPLE[0], { id: 'sp-1', name: 'Johann Goethe', age: 82, iq: 210 })
})
