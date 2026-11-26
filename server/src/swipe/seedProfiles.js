/** @typedef {import('./swipe.contract.js').Profile} Profile */

/**
 * Invented sample profiles for the deck (nobody here is a real person). `_id` is a stable slug the
 * seed upserts by; `order` is the position in the deck.
 */
export const SEED_PROFILES = Object.freeze([
  Object.freeze({ _id: 'mai-tran', name: 'Mai Trần', age: 27, bio: 'Replies in 3 minutes, makes plans in 3 months.', order: 1 }),
  Object.freeze({ _id: 'khoa-le', name: 'Khoa Lê', age: 30, bio: 'Great at memes, allergic to labels.', order: 2 }),
  Object.freeze({ _id: 'linh-pham', name: 'Linh Phạm', age: 24, bio: 'Says "let us see" to everything, even brunch.', order: 3 }),
  Object.freeze({ _id: 'duc-vo', name: 'Đức Võ', age: 29, bio: 'Always almost free this weekend.', order: 4 }),
  Object.freeze({ _id: 'an-nguyen', name: 'An Nguyễn', age: 26, bio: 'Sends good-morning texts, never a good-evening plan.', order: 5 }),
  Object.freeze({ _id: 'hanh-dang', name: 'Hạnh Đặng', age: 33, bio: 'Seen at 9:01, replied at 9:00 the next day.', order: 6 }),
  Object.freeze({ _id: 'bao-ly', name: 'Bảo Lý', age: 22, bio: 'Collects red flags and houseplants.', order: 7 }),
  Object.freeze({ _id: 'thu-ngo', name: 'Thu Ngô', age: 35, bio: 'Dating, but not in love. Honest about it.', order: 8 }),
])

/**
 * Inserts or updates the sample profiles by `_id`. Running it twice leaves the same 8 documents.
 * @param {import('mongoose').Model<any>} ProfileModel
 * @returns {Promise<{ upserted: number, modified: number }>}
 */
export async function seedProfiles(ProfileModel) {
  const result = await ProfileModel.bulkWrite(
    SEED_PROFILES.map(({ _id, ...fields }) => ({
      updateOne: { filter: { _id }, update: { $set: fields }, upsert: true },
    })),
  )
  return { upserted: result.upsertedCount, modified: result.modifiedCount }
}
