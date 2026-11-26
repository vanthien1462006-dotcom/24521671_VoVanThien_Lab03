import { useId } from 'react'
import { ALL_CATEGORY } from './photos.js'
import styles from './CategoryFilter.module.css'

/** @typedef {import('./gallery.contract.js').PhotoCategory} PhotoCategory */

/**
 * Radio group for the category filter. It holds no state: the selected value comes from the
 * URL through the parent, and a change is reported back with the category id.
 * @param {{ categories: readonly PhotoCategory[], value: string, onChange: (categoryId: string) => void }} props
 */
export function CategoryFilter({ categories, value, onChange }) {
  const groupId = useId()
  const options = [{ id: ALL_CATEGORY, label: 'All' }, ...categories]

  return (
    <fieldset className={styles.filter}>
      <legend className={styles.legend}>Category</legend>
      <ul className={styles.options}>
        {options.map((option) => {
          const inputId = `${groupId}-${option.id}`
          return (
            <li key={option.id} className={styles.option}>
              <input
                className={styles.radio}
                type="radio"
                id={inputId}
                name={groupId}
                value={option.id}
                checked={value === option.id}
                onChange={() => onChange(option.id)}
              />
              <label htmlFor={inputId} className={styles.label}>
                {option.label}
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}
