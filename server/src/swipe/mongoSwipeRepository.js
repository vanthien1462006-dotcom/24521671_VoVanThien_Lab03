/** @typedef {import('./swipe.contract.js').SwipeRepository} SwipeRepository */
/** @typedef {import('./swipe.contract.js').Profile} Profile */
/** @typedef {import('./swipe.contract.js').SwipeRecord} SwipeRecord */

/**
 * @param {{ _id: string, name: string, age: number, bio: string }} doc   A lean Profile document.
 * @returns {Profile}
 */
export function toProfile(doc) {
  return { id: doc._id, name: doc.name, age: doc.age, bio: doc.bio }
}

/**
 * @param {{ _id: string, playerId: string, profileId: string, action: import('./swipe.contract.js').SwipeAction, createdAt: Date }} doc
 * @returns {SwipeRecord}
 */
export function toSwipeRecord(doc) {
  return {
    id: doc._id,
    playerId: doc.playerId,
    profileId: doc.profileId,
    action: doc.action,
    createdAt: doc.createdAt.toISOString(),
  }
}

/**
 * MongoDB reports a unique index violation with error code 11000.
 * @param {unknown} err
 * @returns {boolean}
 */
export function isDuplicateKeyError(err) {
  return typeof err === 'object' && err !== null && /** @type {{ code?: unknown }} */ (err).code === 11000
}

/**
 * A clock whose readings strictly increase, even when two swipes land in the same millisecond or
 * the system clock steps back. Sorting by `createdAt` then gives an unambiguous "newest swipe".
 * @param {() => Date} [now]
 * @returns {() => Date}
 */
export function createMonotonicClock(now = () => new Date()) {
  let last = Number.NEGATIVE_INFINITY
  return () => {
    last = Math.max(now().getTime(), last + 1)
    return new Date(last)
  }
}

/**
 * The Mongoose 8 implementation of the swipe repository. Reads use `.lean()`. Every filter value
 * was validated by the route (a UUID or an id pattern), so no request object reaches a query, and
 * a swipe is built from named fields, never from `req.body`.
 * @param {{ Profile: import('mongoose').Model<any>, Swipe: import('mongoose').Model<any>, now?: () => Date }} options
 * @returns {SwipeRepository}
 */
export function createMongoSwipeRepository({ Profile: ProfileModel, Swipe: SwipeModel, now }) {
  const clock = createMonotonicClock(now)

  return {
    async listProfiles() {
      const docs = await ProfileModel.find().sort({ order: 1 }).lean()
      return docs.map(toProfile)
    },
    async hasProfile(profileId) {
      return (await ProfileModel.exists({ _id: profileId })) !== null
    },
    async listSwipes(playerId) {
      const docs = await SwipeModel.find({ playerId }).sort({ createdAt: 1 }).lean()
      return docs.map(toSwipeRecord)
    },
    async createSwipe({ playerId, profileId, action }) {
      try {
        const created = await SwipeModel.create({ playerId, profileId, action, createdAt: clock() })
        return toSwipeRecord(created.toObject())
      } catch (err) {
        if (isDuplicateKeyError(err)) return { conflict: true }
        throw err
      }
    },
    async deleteLastSwipe(playerId) {
      const removed = await SwipeModel.findOneAndDelete({ playerId }, { sort: { createdAt: -1 } }).lean()
      return removed === null ? null : toSwipeRecord(removed)
    },
    async deleteAllSwipes(playerId) {
      const result = await SwipeModel.deleteMany({ playerId })
      return result.deletedCount
    },
  }
}
