/**
 * @typedef {Object} ForumMessage
 * @property {string} id
 * @property {string} author
 * @property {string} text
 * @property {string} timestamp   ISO 8601.
 */

/** @typedef {{ signal?: AbortSignal, fetchImpl?: typeof fetch }} RequestOptions */

export const FORUM_CHANNELS = Object.freeze([
  Object.freeze({ id: 'nasa', label: '#nasa' }),
  Object.freeze({ id: 'esports-tribunal', label: '#esports-tribunal' }),
  Object.freeze({ id: 'notNasa', label: '#notNasa' }),
])

/** @param {unknown} id */
export function isKnownChannel(id) {
  return typeof id === 'string' && FORUM_CHANNELS.some((c) => c.id === id)
}

function messagesUrl(channelId) {
  if (!isKnownChannel(channelId)) throw new Error(`Unknown channel: ${channelId}`)
  return `/api/channels/${encodeURIComponent(channelId)}/messages`
}

async function errorFrom(response) {
  const body = await response.json().catch(() => null)
  return new Error(body?.error ?? `Forum HTTP ${response.status}`)
}

/**
 * GET the messages of one channel. AbortError is not caught: the caller treats it as normal.
 * @param {string} channelId
 * @param {RequestOptions} [options]
 * @returns {Promise<ForumMessage[]>}
 */
export async function fetchChannelMessages(channelId, { signal, fetchImpl = globalThis.fetch } = {}) {
  const url = messagesUrl(channelId)
  const response = await fetchImpl(url, { signal })
  if (!response.ok) throw new Error(`Forum HTTP ${response.status}`)
  const payload = await response.json()
  if (!Array.isArray(payload)) throw new Error('Forum payload is not a list of messages')
  return payload
}

/**
 * POST a new message. Only author and text are sent.
 * @param {string} channelId
 * @param {{ author: string, text: string }} payload
 * @param {RequestOptions} [options]
 * @returns {Promise<ForumMessage>}
 */
export async function postChannelMessage(channelId, { author, text }, { signal, fetchImpl = globalThis.fetch } = {}) {
  const url = messagesUrl(channelId)
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, text }),
    signal,
  })
  if (!response.ok) throw await errorFrom(response)
  return response.json()
}
