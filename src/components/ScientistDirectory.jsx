import { useId, useState } from 'react'
import styles from './ScientistDirectory.module.css'
import { SMART_PEOPLE } from '../data/smartPeople.js'
import { selectVisiblePeople } from '../utils/selectVisiblePeople.js'

/**
 * Directory of pioneers, one row per person.
 * @param {import('../contracts/scientist-directory.contract.js').ScientistDirectoryProps} props
 */
export function ScientistDirectory({ initialData = SMART_PEOPLE }) {
  const headingId = useId()
  const searchId = useId()
  const iqId = useId()
  const sortId = useId()
  const [people] = useState(initialData)
  const [query, setQuery] = useState('')
  const [minIq, setMinIq] = useState(160)
  const [sortBy, setSortBy] = useState('iq-desc')

  const visible = selectVisiblePeople(people, { query, minIq, sortBy })

  function handleIqChange(e) {
    const value = e.target.valueAsNumber
    setMinIq(Number.isNaN(value) ? 0 : value)
  }

  return (
    <section className={styles.directory} aria-labelledby={headingId}>
      <h2 id={headingId}>Pioneer Directory</h2>
      <form role="search" className={styles.controls} onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={searchId}>Name</label>
        <input id={searchId} type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label htmlFor={iqId}>Min IQ</label>
        <input id={iqId} type="number" min="0" value={minIq} onChange={handleIqChange} />
        <label htmlFor={sortId}>Sort by</label>
        <select id={sortId} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="iq-desc">IQ (high to low)</option>
          <option value="age-asc">Age (young to old)</option>
        </select>
      </form>
      <ul className={styles.list}>
        {visible.map((p) => (
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
