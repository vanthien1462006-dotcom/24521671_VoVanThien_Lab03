import { Fragment, useId } from 'react'
import styles from './SimpleForm.module.css'

/**
 * Live data inspector: renders a submitted record as key-value pairs, not as a JSON.stringify dump.
 * @param {{ data: Readonly<Record<string, string | number>> }} props
 */
export function ShowData({ data }) {
  const headingId = useId()
  return (
    <section className={styles.inspector} aria-labelledby={headingId}>
      <h3 id={headingId}>Submitted data</h3>
      <dl className={styles.data}>
        {Object.entries(data).map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd>{String(value)}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  )
}
