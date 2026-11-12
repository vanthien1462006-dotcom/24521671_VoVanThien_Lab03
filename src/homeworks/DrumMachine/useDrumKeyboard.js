import { useEffect } from 'react'
import { shouldHandleKey } from './shouldHandleKey.js'

/** @typedef {import('./drum-machine.contract.js').DrumPad} DrumPad */
/** @typedef {import('./drum-machine.contract.js').DrumPadId} DrumPadId */

/**
 * Plays drum pads from physical keys (KeyboardEvent.code) while enabled.
 * Adds keydown, keyup and blur listeners on window and removes all three in the cleanup.
 * @param {ReadonlyMap<string, DrumPad>} padMap   Pads keyed by KeyboardEvent.code.
 * @param {(padId: DrumPadId) => void} onTriggerPad   Called on keydown of a mapped key.
 * @param {boolean} [isEnabled=true]   When false, no listener is added.
 * @param {(padId: DrumPadId) => void} [onReleasePad]   Called on keyup of a mapped key and for every pad on window blur.
 */
export function useDrumKeyboard(padMap, onTriggerPad, isEnabled = true, onReleasePad) {
  useEffect(() => {
    if (!isEnabled) return undefined
    const onKeyDown = (e) => {
      if (!shouldHandleKey(e, true)) return
      const pad = padMap.get(e.code)
      if (pad) {
        e.preventDefault()
        onTriggerPad(pad.id)
      }
    }
    const onKeyUp = (e) => {
      const pad = padMap.get(e.code)
      if (pad) onReleasePad?.(pad.id)
    }
    const onBlur = () => {
      for (const pad of padMap.values()) onReleasePad?.(pad.id)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [padMap, onTriggerPad, isEnabled, onReleasePad])
}
