import crypto from 'node:crypto'
import mongoose from 'mongoose'

export const SWIPE_ACTIONS = Object.freeze(['LIKE', 'NOPE', 'SUPERLIKE'])

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PROFILE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

/**
 * One saved swipe. The id is a crypto.randomUUID() string (project rule), `createdAt` is set by
 * the repository from a monotonic clock so "the newest swipe" is never ambiguous, and unknown
 * fields are stripped (strict). A player can swipe a profile only once; undo deletes the swipe.
 */
const swipeSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    playerId: { type: String, required: true, match: UUID_PATTERN },
    profileId: { type: String, required: true, match: PROFILE_ID_PATTERN },
    action: { type: String, required: true, enum: SWIPE_ACTIONS },
    createdAt: { type: Date, required: true, immutable: true },
  },
  { strict: true, versionKey: false },
)

swipeSchema.index({ playerId: 1, profileId: 1 }, { unique: true })
swipeSchema.index({ playerId: 1, createdAt: 1 })

export const Swipe = mongoose.model('Swipe', swipeSchema)
