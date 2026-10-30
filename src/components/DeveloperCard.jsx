import { Fragment, useId } from 'react'
import styles from './DeveloperCard.module.css'
import { SkillBadge } from './SkillBadge.jsx'

/**
 * Semantic developer profile card.
 * @param {import('../contracts/developer-card.contract.js').DeveloperCardProps} props
 */
export function DeveloperCard({
  fullName = 'Võ Văn Thiện',
  role = 'Student at the University of Information Technology – VNU-HCM',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240',
  metrics = { commits: 0, vdomNodes: 0, a11yScore: 0 },
  skills = [
    { id: 'sk-1', name: 'React 19 createRoot + StrictMode', tier: 'Core' },
    { id: 'sk-2', name: 'Hooks: useState, useEffect, useId', tier: 'Core' },
    { id: 'sk-3', name: 'Semantic JSX', tier: 'Core' },
    { id: 'sk-4', name: 'React.memo', tier: 'Awareness' },
  ],
}) {
  const headingId = useId()

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <header className={styles.header}>
        <img
          className={styles.avatar}
          src={avatarUrl}
          alt={fullName}
          width="64"
          height="64"
        />
        <hgroup>
          <h2 id={headingId}>{fullName}</h2>
          <p>{role}</p>
        </hgroup>
      </header>
      <dl className={styles.metrics}>
        {Object.entries(metrics).map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>
      <ul className={styles.skills} aria-label="Engineered Skills">
        {skills.map((skill) => (
          <SkillBadge key={skill.id} name={skill.name} tier={skill.tier} />
        ))}
      </ul>
    </article>
  )
}
