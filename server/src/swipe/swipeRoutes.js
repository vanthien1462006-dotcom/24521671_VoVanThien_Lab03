import { Router } from 'express'
import { isPlayerId, validateSwipe } from './validateSwipe.js'

/** @typedef {import('./swipe.contract.js').SwipeRepository} SwipeRepository */

const PLAYER_ID_ERROR = 'playerId must be a UUID.'

/**
 * The swipe deck API, mounted at /api. Handlers are async: Express 5 forwards a rejected promise
 * to the error handler in app.js, which answers 500 with a fixed message. Error bodies never
 * contain a database message.
 * @param {{ repository: SwipeRepository }} options
 */
export function createSwipeRouter({ repository }) {
  const router = Router()

  router.get('/profiles', async (req, res) => {
    res.json(await repository.listProfiles())
  })

  router.get('/swipe', async (req, res) => {
    const { playerId } = req.query
    if (!isPlayerId(playerId)) {
      res.status(400).json({ error: PLAYER_ID_ERROR })
      return
    }
    res.json(await repository.listSwipes(playerId))
  })

  router.post('/swipe', async (req, res) => {
    const result = validateSwipe(req.body)
    if (!result.ok) {
      res.status(400).json({ error: result.error })
      return
    }
    if (!(await repository.hasProfile(result.value.profileId))) {
      res.status(404).json({ error: 'Unknown profile.' })
      return
    }
    const saved = await repository.createSwipe(result.value)
    if ('conflict' in saved) {
      res.status(409).json({ error: 'You already swiped this profile.' })
      return
    }
    res.status(201).json(saved)
  })

  router.delete('/swipe/last', async (req, res) => {
    const { playerId } = req.query
    if (!isPlayerId(playerId)) {
      res.status(400).json({ error: PLAYER_ID_ERROR })
      return
    }
    const removed = await repository.deleteLastSwipe(playerId)
    if (removed === null) {
      res.status(404).json({ error: 'Nothing to undo.' })
      return
    }
    res.json(removed)
  })

  router.delete('/swipe', async (req, res) => {
    const { playerId } = req.query
    if (!isPlayerId(playerId)) {
      res.status(400).json({ error: PLAYER_ID_ERROR })
      return
    }
    await repository.deleteAllSwipes(playerId)
    res.status(204).end()
  })

  return router
}
