/**
 * Builds the initials of a full name: the first letter of the first word and
 * the first letter of the last word, uppercased. A single word gives one letter.
 * Returns '?' when the input is not a string or is blank after trimming.
 * @param {unknown} fullName
 * @returns {string}
 */
export function getInitials(fullName) {
  if (typeof fullName !== 'string') {
    return '?'
  }

  const words = fullName.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return '?'
  }

  const firstLetter = (word) => Array.from(word)[0].toUpperCase()

  if (words.length === 1) {
    return firstLetter(words[0])
  }

  return firstLetter(words[0]) + firstLetter(words[words.length - 1])
}
