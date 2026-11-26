import { Suspense, useId } from 'react'
import { NavLink, Outlet } from 'react-router'
import { ViewSkeleton } from '../../shell/ViewSkeleton.jsx'
import { useDossierList } from './useDossier.js'
import styles from './DossierLayout.module.css'

/**
 * Frame of the Fair-Play Appeal Tribunal: the sidebar lists every case from the API and the child
 * route renders in the Outlet. The case routes are one dynamic route (`/dossier/:playerID`), not
 * one hard-coded route per player.
 */
export function DossierLayout() {
  const headingId = useId()
  const list = useDossierList()

  return (
    <section className={styles.frame} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        Fair-Play Appeal Tribunal
      </h2>
      <p className={styles.notice}>All players, cases and numbers here are invented sample data.</p>
      <nav className={styles.sidebar} aria-label="Cases">
        {list.status === 'loading' ? <p>Loading cases…</p> : null}
        {list.status === 'error' ? (
          <p role="alert">
            {list.error}{' '}
            <button type="button" className={styles.retry} onClick={list.retry}>
              Try again
            </button>
          </p>
        ) : null}
        {list.status === 'ready' ? (
          <ul className={styles.list}>
            {list.dossiers.map((entry) => (
              <li key={entry.playerId}>
                <NavLink to={`/dossier/${entry.playerId}`} className={({ isActive }) => (isActive ? styles.activeLink : styles.link)}>
                  {entry.handle} <span className={styles.caseId}>{entry.caseId}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        ) : null}
      </nav>
      <section className={styles.content} aria-label="Selected case">
        <Suspense fallback={<ViewSkeleton size="detail" label="Loading case" />}>
          <Outlet />
        </Suspense>
      </section>
    </section>
  )
}
