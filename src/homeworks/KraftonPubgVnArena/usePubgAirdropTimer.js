import { useEffect, useState } from 'react'
import { computeRemainingMs } from './airdropClock.js'

/**
 * Anti-drift airdrop countdown.
 *
 * The only state is nowMs, the last clock reading. Remaining time is not stored:
 * it is computed during render from the target epoch, so it cannot drift and it is
 * correct on the very render where targetEpochMs or serverOffsetMs changes.
 *
 * One effect owns the clock. It reads the clock every 200 ms and on visibilitychange.
 * Browsers throttle timers in background tabs, so when the tab becomes visible again the
 * clock is read at once and the countdown jumps to the right value instead of lagging.
 * The effect only sets state inside callbacks, never synchronously in its body, and its
 * cleanup clears the timer and removes the listener.
 *
 * @param {number} targetEpochMs   Drop time as epoch milliseconds.
 * @param {number} [serverOffsetMs=0]   Server clock minus local clock, in milliseconds.
 * @param {() => number} [now=Date.now]   Clock source; inject a fake in tests.
 * @returns {{ remainingMs: number, isLive: boolean, nowMs: number }}
 *   nowMs is the last clock tick, so callers can derive the phase without reading the clock in render.
 */
export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0, now = Date.now) {
  const [nowMs, setNowMs] = useState(now)

  useEffect(() => {
    const syncClock = () => setNowMs(now())
    const timerId = window.setInterval(syncClock, 200)
    const onWake = () => {
      if (document.visibilityState === 'visible') syncClock()
    }
    document.addEventListener('visibilitychange', onWake)
    return () => {
      window.clearInterval(timerId)
      document.removeEventListener('visibilitychange', onWake)
    }
  }, [now])

  const remainingMs = computeRemainingMs(targetEpochMs, nowMs, serverOffsetMs)
  return { remainingMs, isLive: remainingMs === 0, nowMs }
}
