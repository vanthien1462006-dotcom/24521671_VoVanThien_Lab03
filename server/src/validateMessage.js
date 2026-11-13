const LIMITS = Object.freeze({ author: 40, text: 500 })

/**
 * Validates a POST body. Only `author` and `text` are copied out; every other field is dropped,
 * so a client cannot forge `id`, `timestamp` or any extra property.
 * @param {unknown} body
 * @returns {{ ok: true, value: { author: string, text: string } } | { ok: false, error: string }}
 */
export function validateMessage(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object with author and text.' }
  }
  const value = {}
  for (const [field, max] of Object.entries(LIMITS)) {
    const raw = body[field]
    const trimmed = typeof raw === 'string' ? raw.trim() : ''
    if (trimmed.length === 0) return { ok: false, error: `Missing required field: ${field}.` }
    if (trimmed.length > max) return { ok: false, error: `Field ${field} must be ${max} characters or fewer.` }
    value[field] = trimmed
  }
  return { ok: true, value }
}
