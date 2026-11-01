import { useId, useState } from 'react'
import styles from './ScientistDirectory.module.css'
import { SMART_PEOPLE } from '../data/smartPeople.js'

/**
 * Directory of pioneers, one row per person.
 * @param {import('../contracts/scientist-directory.contract.js').ScientistDirectoryProps} props
 */
export function ScientistDirectory({ initialData = SMART_PEOPLE }) {
  const headingId = useId()
  const [people] = useState(initialData)

  return (
    <section className={styles.directory} aria-labelledby={headingId}>
      <h2 id={headingId}>Pioneer Directory</h2>
      <ul className={styles.list}>
        {people.map((p) => (
          <li key={p.id} className={styles.row}>
            <p className={styles.name}>{p.name}</p>
            <dl className={styles.stats}>
              <dt>Age</dt>
              <dd>{p.age}</dd>
              <dt>IQ</dt>
              <dd>{p.iq}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  )
}
