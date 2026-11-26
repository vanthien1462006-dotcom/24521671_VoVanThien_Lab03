import mongoose from 'mongoose'
import { createApp } from './app.js'
import { createAppealStore } from './appeal/appealStore.js'
import { DOSSIERS } from './appeal/dossierData.js'
import { SEED_MESSAGES, createMessageStore } from './messageStore.js'
import { Profile } from './swipe/Profile.js'
import { Swipe } from './swipe/Swipe.js'
import { createMongoSwipeRepository } from './swipe/mongoSwipeRepository.js'

// Config comes only from the environment (`npm start` loads ../.env). Fail fast when it is missing.
async function main() {
  const { PORT, CLIENT_ORIGIN } = process.env
  if (!PORT || !CLIENT_ORIGIN) {
    throw new Error('PORT and CLIENT_ORIGIN are required: copy .env.example to .env at the repository root')
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required: copy .env.example to .env at the repository root')
  }

  // Mongoose 8: no deprecated connection flags. A short selection timeout makes a wrong URI fail fast.
  mongoose.set('sanitizeFilter', true)
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  await Promise.all([Profile.init(), Swipe.init()]) // the unique indexes exist before the first request

  const app = createApp({
    store: createMessageStore(SEED_MESSAGES),
    clientOrigin: CLIENT_ORIGIN,
    swipeRepository: createMongoSwipeRepository({ Profile, Swipe }),
    appealStore: createAppealStore({ dossiers: DOSSIERS }),
  })
  const server = app.listen(Number(PORT), () => {
    console.log(`API listening on port ${PORT}, CORS origin ${CLIENT_ORIGIN}, MongoDB connected`)
  })

  const shutdown = () => {
    server.close(() => {
      mongoose.disconnect().finally(() => process.exit(0))
    })
  }
  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error(`Server failed to start: ${err.message}`)
  process.exit(1)
})
