import styles from './ProfileCard.module.css'

/** @typedef {import('./swipe.contract.js').Profile} Profile */

/**
 * First letter of the first and last word of a name ("Mai Trần" gives "MT").
 * @param {string} name
 */
function initialsOf(name) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = [words[0], words.length > 1 ? words.at(-1) : undefined].filter(Boolean)
  return letters.map((word) => Array.from(word)[0].toUpperCase()).join('')
}

/**
 * One card of the deck. The avatar is only initials on a colour, so it is hidden from assistive
 * technology: the name is already text. All profile text is untrusted and rendered as text.
 * @param {{ profile: Profile }} props
 */
export function ProfileCard({ profile }) {
  return (
    <article className={styles.card} aria-label={`${profile.name}, ${profile.age}`}>
      <span className={styles.avatar} aria-hidden="true">
        {initialsOf(profile.name)}
      </span>
      <h3 className={styles.name}>
        {profile.name}, <span className={styles.age}>{profile.age}</span>
      </h3>
      <p className={styles.bio}>{profile.bio}</p>
    </article>
  )
}
