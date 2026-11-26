import { useEffect, useRef, useState } from 'react'
import { ensurePlayerId } from './playerId.js'
import { SwipeApiError, fetchProfiles, fetchSwipes, postSwipe, resetSwipes, undoLastSwipe } from './swipeApi.js'
import { EMPTY_HISTORY, popSwipe, pushSwipe } from './swipeHistory.js'
import { scoreOf, statsOf } from './swipeRules.js'

/** @typedef {import('./swipe.contract.js').Profile} Profile */
/** @typedef {import('./swipe.contract.js').SwipeRecord} SwipeRecord */
/** @typedef {import('./swipe.contract.js').SwipeAction} SwipeAction */

const VERB_BY_ACTION = Object.freeze({ LIKE: 'Liked', NOPE: 'Passed on', SUPERLIKE: 'Super liked' })

/** The browser storage, or null when access is blocked (some private windows throw on access). */
function browserStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** @param {unknown} err */
function messageOf(err) {
  return err instanceof SwipeApiError ? err.message : 'Could not reach the server. Check the connection and try again.'
}

/**
 * State and actions of the swipe deck. The server is the source of truth and the client is
 * pessimistic: an action sets `busy`, waits for the response and only then changes the list, using
 * the record the server returned. Input is ignored while `busy`. Everything shown (current card,
 * score, counts) is derived from `profiles` and `history` during render.
 *
 * @returns {{
 *   status: 'loading' | 'error' | 'ready',
 *   loadError: string | null,
 *   profiles: readonly Profile[],
 *   history: readonly SwipeRecord[],
 *   current: Profile | null,
 *   score: number,
 *   stats: Record<SwipeAction, number>,
 *   busy: boolean,
 *   actionError: string | null,
 *   announcement: string,
 *   swipe: (action: SwipeAction) => Promise<void>,
 *   undo: () => Promise<void>,
 *   reset: () => Promise<void>,
 *   retry: () => void,
 * }}
 */
export function useSwipeDeck() {
  const [playerId] = useState(() => ensurePlayerId(browserStorage()))
  const [attempt, setAttempt] = useState(0)
  /** @type {[{ attempt: number, profiles?: Profile[], history?: readonly SwipeRecord[], error?: string } | null, Function]} */
  const [loaded, setLoaded] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(/** @type {string | null} */ (null))
  const [announcement, setAnnouncement] = useState('')
  const busyRef = useRef(false)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    Promise.all([fetchProfiles({ signal }), fetchSwipes(playerId, { signal })])
      .then(([profiles, swipes]) => {
        setLoaded({ attempt, profiles, history: Object.freeze([...swipes]) })
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setLoaded({ attempt, error: messageOf(err) })
      })
    return () => controller.abort()
  }, [playerId, attempt])

  const isCurrent = loaded !== null && loaded.attempt === attempt
  const status = !isCurrent ? 'loading' : loaded.error === undefined ? 'ready' : 'error'
  const profiles = isCurrent ? (loaded.profiles ?? []) : []
  const history = isCurrent ? (loaded.history ?? EMPTY_HISTORY) : EMPTY_HISTORY

  const swiped = new Set(history.map((entry) => entry.profileId))
  const current = profiles.find((profile) => !swiped.has(profile.id)) ?? null
  const score = scoreOf(history)
  const stats = statsOf(history)

  /** Start an action: returns false when another one is running. */
  function begin() {
    if (busyRef.current) return false
    busyRef.current = true
    setBusy(true)
    setActionError(null)
    return true
  }

  function end() {
    busyRef.current = false
    setBusy(false)
  }

  /** The list on screen no longer matches the server (another tab changed it): load it again. */
  function resync() {
    setAttempt((n) => n + 1)
  }

  /** @param {(previous: readonly SwipeRecord[]) => readonly SwipeRecord[]} change */
  function changeHistory(change) {
    setLoaded((previous) =>
      previous === null || previous.error !== undefined ? previous : { ...previous, history: change(previous.history ?? EMPTY_HISTORY) },
    )
  }

  /** @param {SwipeAction} action */
  async function swipe(action) {
    if (status !== 'ready' || current === null || !begin()) return
    try {
      const saved = await postSwipe({ playerId, profileId: current.id, action })
      const next = pushSwipe(history, saved)
      changeHistory(() => next)
      setAnnouncement(`${VERB_BY_ACTION[action]} ${current.name}. Score ${scoreOf(next)}.`)
    } catch (err) {
      setActionError(messageOf(err))
      if (err instanceof SwipeApiError && err.status === 409) resync()
    } finally {
      end()
    }
  }

  async function undo() {
    if (status !== 'ready' || history.length === 0 || !begin()) return
    try {
      const removed = await undoLastSwipe(playerId)
      const { history: next, removed: local } = popSwipe(history)
      if (local === null || local.id !== removed.id) {
        resync()
      } else {
        changeHistory(() => next)
        const name = profiles.find((profile) => profile.id === removed.profileId)?.name ?? 'the last card'
        setAnnouncement(`Undid ${name}. Score ${scoreOf(next)}.`)
      }
    } catch (err) {
      setActionError(messageOf(err))
      if (err instanceof SwipeApiError && err.status === 404) resync()
    } finally {
      end()
    }
  }

  async function reset() {
    if (status !== 'ready' || history.length === 0 || !begin()) return
    try {
      await resetSwipes(playerId)
      changeHistory(() => EMPTY_HISTORY)
      setAnnouncement('Started over. Score 0.')
    } catch (err) {
      setActionError(messageOf(err))
    } finally {
      end()
    }
  }

  function retry() {
    setActionError(null)
    resync()
  }

  return {
    status,
    loadError: isCurrent ? (loaded.error ?? null) : null,
    profiles,
    history,
    current,
    score,
    stats,
    busy,
    actionError,
    announcement,
    swipe,
    undo,
    reset,
    retry,
  }
}
