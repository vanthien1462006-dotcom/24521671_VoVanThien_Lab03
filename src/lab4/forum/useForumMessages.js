import { useCallback, useEffect, useState } from 'react'
import { fetchChannelMessages, postChannelMessage } from './forumApi.js'

/** @typedef {import('./forumApi.js').ForumMessage} ForumMessage */

const EMPTY_RESULT = Object.freeze({ requestKey: null, channelId: null, messages: [], error: null })

/**
 * Loads the messages of one channel and refetches after a successful post.
 *
 * Every request gets its own AbortController and the cleanup aborts it, so a fast channel switch
 * cancels the request in flight and an old response can never overwrite the new channel.
 * After each await the hook checks signal.aborted before setting state.
 *
 * Loading is derived, not stored: the effect never calls setState synchronously. A result belongs
 * to one request key (channel + reload tick); while the stored key differs from the current one,
 * the request for the current key is still in flight.
 *
 * @param {string} channelId
 * @returns {{ messages: ForumMessage[], loading: boolean, error: string | null, postMessage: (payload: { author: string, text: string }) => Promise<ForumMessage> }}
 */
export function useForumMessages(channelId) {
  const [reloadTick, setReloadTick] = useState(0)
  const [result, setResult] = useState(EMPTY_RESULT)
  const requestKey = `${channelId}#${reloadTick}`

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const messages = await fetchChannelMessages(channelId, { signal: controller.signal })
        if (!controller.signal.aborted) setResult({ requestKey, channelId, messages, error: null })
      } catch (err) {
        if (controller.signal.aborted || err.name === 'AbortError') return
        setResult({ requestKey, channelId, messages: [], error: err.message })
      }
    }
    load()
    return () => controller.abort()
  }, [channelId, requestKey])

  const postMessage = useCallback(
    async (payload) => {
      const created = await postChannelMessage(channelId, payload)
      setReloadTick((tick) => tick + 1)
      return created
    },
    [channelId],
  )

  const loading = result.requestKey !== requestKey
  // Keep showing the current channel's list while it reloads after a post; never show another channel's list.
  const messages = result.channelId === channelId ? result.messages : []
  return { messages, loading, error: loading ? null : result.error, postMessage }
}
