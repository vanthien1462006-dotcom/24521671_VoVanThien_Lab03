import { lazy } from 'react'

/**
 * Wraps a dynamic import so React.lazy receives `{ default: Component }` from a named export.
 * The loader runs only when React first renders the lazy component.
 * @param {() => Promise<Record<string, unknown>>} loader   For example `() => import('./DrumMachine.jsx')`.
 * @param {string} name   The named export to use.
 * @returns {() => Promise<{ default: Function }>}
 */
export function pickNamedExport(loader, name) {
  return async () => {
    const module = await loader()
    const component = module[name]
    if (typeof component !== 'function') {
      throw new Error(`Lazy module has no component export named ${name}`)
    }
    return { default: component }
  }
}

/**
 * React.lazy for a named export: each call creates its own code-split chunk boundary.
 * @param {() => Promise<Record<string, unknown>>} loader
 * @param {string} name
 */
export function lazyNamed(loader, name) {
  return lazy(pickNamedExport(loader, name))
}
