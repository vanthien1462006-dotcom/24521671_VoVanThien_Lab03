import { useSyncExternalStore } from 'react'
import { resolveView } from './resolveView.js'

function subscribe(onChange) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useHashView() {
  return useSyncExternalStore(subscribe, () => resolveView(window.location.hash))
}
