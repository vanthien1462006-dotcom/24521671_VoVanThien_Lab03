import { test } from 'node:test'
import assert from 'node:assert/strict'
import { NAV_ITEMS } from './navItems.js'

const LAB3_PATHS = ['/', '/hw1', '/hw2', '/hw3', '/bonus']
const LAB4_PATHS = ['/people']

test('NAV_ITEMS is frozen with frozen entries', () => {
  assert.ok(Object.isFrozen(NAV_ITEMS))
  for (const item of NAV_ITEMS) assert.ok(Object.isFrozen(item))
})

test('every nav item has an absolute path and a label', () => {
  for (const item of NAV_ITEMS) {
    assert.match(item.to, /^\/[a-z0-9/-]*$/)
    assert.ok(item.label.trim().length > 0)
  }
})

test('nav paths are unique (they are also the React keys)', () => {
  const paths = NAV_ITEMS.map((item) => item.to)
  assert.equal(new Set(paths).size, paths.length)
})

test('every Lab 3 hash view has a route path', () => {
  const paths = NAV_ITEMS.map((item) => item.to)
  for (const path of LAB3_PATHS) assert.ok(paths.includes(path), path)
})

test('every Lab 4 exercise route has a nav link', () => {
  const paths = NAV_ITEMS.map((item) => item.to)
  for (const path of LAB4_PATHS) assert.ok(paths.includes(path), path)
})

test('only the home link matches exactly (end), so it is not active on every page', () => {
  for (const item of NAV_ITEMS) assert.equal(item.end === true, item.to === '/', item.to)
})
