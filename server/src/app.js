import crypto from 'node:crypto'
import cors from 'cors'
import express from 'express'
import { validateMessage } from './validateMessage.js'

/**
 * Builds the REST API. No listen() here, so tests can start it on a random port.
 * @param {{ store: ReturnType<typeof import('./messageStore.js').createMessageStore>, clientOrigin: string, now?: () => Date }} options
 */
export function createApp({ store, clientOrigin, now = () => new Date() }) {
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
