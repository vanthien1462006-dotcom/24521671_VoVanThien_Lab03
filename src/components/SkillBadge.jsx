import styles from './SkillBadge.module.css'

/**
 * One skill label. Reads as "name (tier)" for screen readers.
 * The parent list supplies the React key.
 * @param {import('../contracts/developer-card.contract.js').SkillBadgeProps} props
 */
export function SkillBadge({ name, tier = 'Core' }) {
  return (
    <li className={styles.badge}>
      <span className={styles.name}>{name}</span>
      {' ('}
      <span className={styles.tier}>{tier}</span>
      {')'}
    </li>
  )
}
