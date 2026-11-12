import { Fragment, useId, useState } from 'react'
import styles from './DeveloperCard.module.css'
import { SkillBadge } from './SkillBadge.jsx'
import { getInitials } from '../utils/getInitials.js'

/**
 * Semantic developer profile card.
 * @param {import('../contracts/developer-card.contract.js').DeveloperCardProps} props
 */
export function DeveloperCard({
  fullName = 'Võ Văn Thiện',
  role = 'Student at the University of Information Technology – VNU-HCM',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240',
  metrics = { commits: 129, vdomNodes: 0, a11yScore: 100 },
  skills = [
    { id: 'sk-1', name: 'React 19 createRoot + StrictMode', tier: 'Core' },
    { id: 'sk-2', name: 'Hooks: useState, useEffect, useId', tier: 'Core' },
    { id: 'sk-3', name: 'Semantic JSX', tier: 'Core' },
    { id: 'sk-4', name: 'React.memo', tier: 'Awareness' },
  ],
}) {
  const headingId = useId()
  const [failedUrl, setFailedUrl] = useState(null)
  const showInitials = failedUrl === avatarUrl

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <header className={styles.header}>
        {showInitials ? (
          <span className={styles.initials} role="img" aria-label={fullName}>
            {getInitials(fullName)}
          </span>
        ) : (
          <img
            className={styles.avatar}
            src={avatarUrl}
            alt={fullName}
            width="64"
            height="64"
            onError={() => setFailedUrl(avatarUrl)}
          />
        )}
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
