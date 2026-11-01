import { useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import styles from './ScientistDirectory.module.css'
import { SMART_PEOPLE } from '../data/smartPeople.js'
import { selectVisiblePeople } from '../utils/selectVisiblePeople.js'
import { pickNextFocusId } from '../utils/pickNextFocusId.js'

/**
 * Directory of pioneers, one row per person.
 * @param {import('../contracts/scientist-directory.contract.js').ScientistDirectoryProps} props
 */
export function ScientistDirectory({ initialData = SMART_PEOPLE }) {
  const headingId = useId()
  const searchId = useId()
  const iqId = useId()
  const sortId = useId()
  const [people, setPeople] = useState(initialData)
  const [query, setQuery] = useState('')
  const [minIq, setMinIq] = useState(160)
  const [sortBy, setSortBy] = useState('iq-desc')
  const searchInputRef = useRef(null)
  const deleteButtonsRef = useRef(new Map())

  const visible = selectVisiblePeople(people, { query, minIq, sortBy })

  const handleDelete = (id) => {
    const nextId = pickNextFocusId(
      visible.map((p) => p.id),
      id,
    )
    flushSync(() => {
      setPeople((prev) => prev.filter((p) => p.id !== id))
    })
    const target = nextId === null ? searchInputRef.current : deleteButtonsRef.current.get(nextId)
    target?.focus()
  }
  const handleReset = () => setPeople(initialData)

  function handleIqChange(e) {
    const value = e.target.valueAsNumber
    setMinIq(Number.isNaN(value) ? 0 : value)
  }

  return (
    <section className={styles.directory} aria-labelledby={headingId}>
      <h2 id={headingId}>Pioneer Directory</h2>
      <form role="search" className={styles.controls} onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={searchId}>Name</label>
        <input
          id={searchId}
          ref={searchInputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label htmlFor={iqId}>Min IQ</label>
        <input id={iqId} type="number" min="0" value={minIq} onChange={handleIqChange} />
        <label htmlFor={sortId}>Sort by</label>
        <select id={sortId} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="iq-desc">IQ (high to low)</option>
          <option value="age-asc">Age (young to old)</option>
        </select>
      </form>
      <output role="status" aria-live="polite" className={styles.status}>
        {`Found ${visible.length} ${visible.length === 1 ? 'pioneer' : 'pioneers'}`}
      </output>
      <button type="button" className={styles.reset} onClick={handleReset}>
        Reset list
      </button>
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
            <button
              type="button"
              ref={(node) => {
                deleteButtonsRef.current.set(p.id, node)
                return () => {
                  deleteButtonsRef.current.delete(p.id)
                }
              }}
              className={styles.delete}
              aria-label={`Delete ${p.name}`}
              onClick={() => handleDelete(p.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
