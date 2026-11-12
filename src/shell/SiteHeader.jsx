import { VIEWS } from './resolveView.js'
import styles from './SiteHeader.module.css'

export function SiteHeader({ view }) {
  return (
    <header className={styles.header}>
      <h1>Lab 3: React 19 Exercises</h1>
      <nav aria-label="Lab sections">
        <ul className={styles.links}>
          {VIEWS.map((v) => (
            <li key={v.id}>
              <a href={`#${v.id}`} aria-current={v.id === view ? 'page' : undefined}>
                {v.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
