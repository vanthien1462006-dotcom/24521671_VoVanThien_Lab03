import mongoose from 'mongoose'

/**
 * A card in the deck. The id is a stable slug so the seed script can upsert by it. `order` is the
 * position in the deck. All profiles are invented sample data.
 */
const profileSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, match: /^[A-Za-z0-9_-]{1,64}$/ },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 60 },
    age: { type: Number, required: true, min: 18, max: 99, validate: Number.isInteger },
    bio: { type: String, required: true, trim: true, minlength: 1, maxlength: 140 },
    order: { type: Number, required: true, validate: Number.isInteger },
  },
  { strict: true, versionKey: false },
)

profileSchema.index({ order: 1 }, { unique: true })

export const Profile = mongoose.model('Profile', profileSchema)
