export const DB_FLOOR = -60

/**
 * Converts audio samples to an integer dBFS level in [DB_FLOOR, 0].
 * @param {ArrayLike<number>} samples
 * @returns {number}
 */
export function toDecibels(samples) {
  const count = samples.length
  if (count === 0) return DB_FLOOR
  let sumOfSquares = 0
  for (let i = 0; i < count; i += 1) {
    sumOfSquares += samples[i] * samples[i]
  }
  const rms = Math.sqrt(sumOfSquares / count)
  if (rms === 0) return DB_FLOOR
  const db = Math.round(20 * Math.log10(rms))
  return Math.min(0, Math.max(DB_FLOOR, db)) || 0
}
