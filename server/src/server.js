import { createApp } from './app.js'
import { SEED_MESSAGES, createMessageStore } from './messageStore.js'

// Config comes only from the environment (`npm start` loads ../.env). Fail fast when it is missing.
const { PORT, CLIENT_ORIGIN } = process.env
if (!PORT || !CLIENT_ORIGIN) {
  throw new Error('PORT and CLIENT_ORIGIN are required: copy .env.example to .env at the repository root')
}

const app = createApp({ store: createMessageStore(SEED_MESSAGES), clientOrigin: CLIENT_ORIGIN })
app.listen(Number(PORT), () => {
  console.log(`Forum API listening on port ${PORT}, CORS origin ${CLIENT_ORIGIN}`)
})
