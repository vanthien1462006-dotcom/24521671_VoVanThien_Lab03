import { NavLink } from 'react-router'
import { NAV_ITEMS } from './navItems.js'
import styles from './SiteHeader.module.css'

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <h1>Lab 4: Multi-Route SPA</h1>
      <nav aria-label="Lab sections">
        <ul className={styles.links}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? styles.active : styles.link)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
