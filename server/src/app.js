import crypto from 'node:crypto'
import cors from 'cors'
import express from 'express'
import { createAppealRouter } from './appeal/appealRoutes.js'
import { createSwipeRouter } from './swipe/swipeRoutes.js'
import { validateMessage } from './validateMessage.js'

/**
 * Builds the REST API. No listen() here, so tests can start it on a random port.
 * The swipe deck routes are mounted only when a `swipeRepository` is given, the appeal tribunal
 * routes only when an `appealStore` is given.
 * @param {{ store: ReturnType<typeof import('./messageStore.js').createMessageStore>, clientOrigin: string, now?: () => Date, swipeRepository?: import('./swipe/swipe.contract.js').SwipeRepository, appealStore?: import('./appeal/appeal.contract.js').AppealStore }} options
 */
export function createApp({ store, clientOrigin, now = () => new Date(), swipeRepository, appealStore }) {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors({ origin: clientOrigin }))
  app.use(express.json({ limit: '10kb' }))

  app.get('/api/channels/:channelId/messages', (req, res) => {
    const { channelId } = req.params
    if (!store.has(channelId)) {
      res.status(404).json({ error: `Unknown channel: ${channelId}` })
      return
    }
    res.json(store.list(channelId))
  })

  app.post('/api/channels/:channelId/messages', (req, res) => {
    const { channelId } = req.params
    if (!store.has(channelId)) {
      res.status(404).json({ error: `Unknown channel: ${channelId}` })
      return
    }
    const result = validateMessage(req.body)
    if (!result.ok) {
      res.status(400).json({ error: result.error })
      return
    }
    const message = { id: crypto.randomUUID(), ...result.value, timestamp: now().toISOString() }
    res.status(201).json(store.add(channelId, message))
  })

  if (swipeRepository) app.use('/api', createSwipeRouter({ repository: swipeRepository }))
  if (appealStore) app.use('/api', createAppealRouter({ store: appealStore }))

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  // Express needs four parameters to treat this as the error handler (malformed JSON, body too large).
  app.use((err, req, res, _next) => {
    const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500 ? err.status : 500
    const error =
      status === 500 ? 'Internal server error' : err.type === 'entity.parse.failed' ? 'Malformed JSON body' : err.message
    res.status(status).json({ error })
  })

  return app
}
