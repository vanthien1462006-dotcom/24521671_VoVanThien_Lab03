import { Router } from 'express'
import { isDossierId, validateAppeal } from './validateAppeal.js'

/** @typedef {import('./appeal.contract.js').AppealStore} AppealStore */

const UNKNOWN_DOSSIER = 'Unknown dossier.'
const FAILURES = Object.freeze({
  duplicate: 'An appeal was already submitted for this case.',
  closed: 'The appeal window has closed.',
})

/**
 * The appeal tribunal API, mounted at /api. Time-dependent answers are never cached: the client
 * uses them to estimate its clock offset. A malformed id is answered like an unknown one, and error
 * bodies are fixed text that never repeats the request. A thrown error reaches the handler in
 * app.js, which answers 500 with a fixed message.
 * @param {{ store: AppealStore }} options
 */
export function createAppealRouter({ store }) {
  const router = Router()

  router.get('/time', (req, res) => {
    res.set('Cache-Control', 'no-store')
    res.json({ now: store.now() })
  })

  router.get('/dossiers', (req, res) => {
    res.json(store.listDossiers())
  })

  router.get('/dossiers/:playerId', (req, res) => {
    const { playerId } = req.params
    const dossier = isDossierId(playerId) ? store.getDossier(playerId) : null
    if (dossier === null) {
      res.status(404).json({ error: UNKNOWN_DOSSIER })
      return
    }
    res.set('Cache-Control', 'no-store')
    res.json(dossier)
  })

  router.post('/dossiers/:playerId/appeal', (req, res) => {
    const { playerId } = req.params
    if (!isDossierId(playerId) || store.getDossier(playerId) === null) {
      res.status(404).json({ error: UNKNOWN_DOSSIER })
      return
    }
    const result = validateAppeal(req.body)
    if (!result.ok) {
      res.status(400).json({ error: result.error })
      return
    }
    const submitted = store.submitAppeal(playerId, result.value)
    if ('receipt' in submitted) {
      res.status(201).json(submitted.receipt)
      return
    }
    if (submitted.failure === 'not-found') {
      res.status(404).json({ error: UNKNOWN_DOSSIER })
      return
    }
    res.status(409).json({ error: FAILURES[submitted.failure] })
  })

  return router
}
