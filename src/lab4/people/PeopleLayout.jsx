import { Suspense, useId } from 'react'
import { NavLink, Outlet } from 'react-router'
import { ViewSkeleton } from '../../shell/ViewSkeleton.jsx'
import styles from './PeopleLayout.module.css'

/**
 * Master-detail frame: the sidebar lists every person, the child route renders in the Outlet.
 * @param {{ people: readonly import('../../contracts/scientist-directory.contract.js').Pioneer[] }} props
 */
export function PeopleLayout({ people }) {
  const headingId = useId()
  return (
    <section className={styles.frame} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        Pioneer Dossiers
      </h2>
      <nav className={styles.sidebar} aria-label="Pioneers">
        <ul className={styles.list}>
          {people.map((p) => (
            <li key={p.id}>
              <NavLink
                to={`/people/${p.id}`}
                className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}
              >
                {p.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <section className={styles.content} aria-label="Selected pioneer">
        <Suspense fallback={<ViewSkeleton size="detail" label="Loading pioneer" />}>
          <Outlet />
        </Suspense>
      </section>
    </section>
  )
}
