import { useEffect, useState } from 'react'
import { DossierApiError, fetchDossier, isDossierId } from './dossierApi.js'

/** @typedef {import('./appeal.contract.js').Dossier} Dossier */
/** @typedef {import('./appeal.contract.js').AppealReceipt} AppealReceipt */

const GENERIC_ERROR = 'Could not load the dossier. Check the connection and try again.'

/**
 * Loads one dossier. The route parameter is untrusted: a value that is not a slug is "not-found"
 * and no request is made. Every load has a key (the id and the attempt); a result is only used when
 * its key is the current one, so `status` is derived during render and no effect has to reset it
 * when the id changes. The only effect starts the request, aborts it on cleanup and ignores
 * `AbortError`.
 *
 * @param {string | undefined} playerId   Straight from `useParams`.
 * @returns {{
 *   status: 'loading' | 'not-found' | 'error' | 'ready',
 *   dossier: Dossier | null,
 *   appeal: AppealReceipt | null,
 *   offsetMs: number,
 *   error: string | null,
 *   retry: () => void,
 *   recordAppeal: (receipt: AppealReceipt) => void,
 * }}
 */
export function useDossier(playerId) {
  const [attempt, setAttempt] = useState(0)
  const valid = isDossierId(playerId)
  const key = `${valid ? playerId : ''}#${attempt}`
  /** @type {[{ key: string, dossier?: Dossier, offsetMs?: number, notFound?: boolean, error?: string } | null, Function]} */
  const [loaded, setLoaded] = useState(null)
  /** @type {[{ key: string, receipt: AppealReceipt } | null, Function]} */
  const [submitted, setSubmitted] = useState(null)

  useEffect(() => {
    if (!valid) return undefined
    const controller = new AbortController()
    fetchDossier(playerId, { signal: controller.signal })
      .then(({ dossier, offsetMs }) => setLoaded({ key, dossier, offsetMs }))
      .catch((err) => {
        if (err?.name === 'AbortError') return
        if (err instanceof DossierApiError && err.status === 404) {
          setLoaded({ key, notFound: true })
          return
        }
        setLoaded({ key, error: err instanceof DossierApiError ? err.message : GENERIC_ERROR })
      })
    return () => controller.abort()
  }, [playerId, valid, key])

  const current = loaded !== null && loaded.key === key ? loaded : null
  const dossier = current?.dossier ?? null
  const status = !valid || current?.notFound ? 'not-found' : current === null ? 'loading' : current.error !== undefined ? 'error' : 'ready'
  const appeal = submitted !== null && submitted.key === key ? submitted.receipt : (dossier?.appeal ?? null)

  return {
    status,
    dossier,
    appeal,
    offsetMs: current?.offsetMs ?? 0,
    error: current?.error ?? null,
    retry: () => setAttempt((n) => n + 1),
    recordAppeal: (receipt) => setSubmitted({ key, receipt }),
  }
}
