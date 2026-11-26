import mongoose from 'mongoose'
import { Profile } from './Profile.js'
import { seedProfiles } from './seedProfiles.js'

// Usage: npm --prefix server run seed (loads ../.env). Safe to run more than once.
async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required: copy .env.example to .env at the repository root')
  }
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  try {
    await Profile.init()
    const { upserted, modified } = await seedProfiles(Profile)
    console.log(`Seeded profiles: ${upserted} added, ${modified} updated.`)
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((err) => {
  console.error(`Seed failed: ${err.message}`)
  process.exit(1)
})
