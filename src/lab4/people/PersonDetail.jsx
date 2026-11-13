import { Fragment, useId } from 'react'
import { useParams } from 'react-router'
import { findPersonById } from './findPersonById.js'
import styles from './PersonDetail.module.css'

/**
 * Detail route /people/:id. Loaded with React.lazy (Exercise 1.1), so it is the default export.
 * @param {{ people: readonly import('../../contracts/scientist-directory.contract.js').Pioneer[] }} props
 */
export default function PersonDetail({ people }) {
  const headingId = useId()
  const { id } = useParams()
  const person = findPersonById(people, id)

  if (!person) {
    return (
      <p className={styles.notFound} role="alert">
        404: Person Not Found
      </p>
    )
  }

  const fields = { Name: person.name, Age: person.age, IQ: person.iq }
  return (
    <article className={styles.detail} aria-labelledby={headingId}>
      <h3 id={headingId}>{person.name}</h3>
      <dl className={styles.fields}>
        {Object.entries(fields).map(([label, value]) => (
          <Fragment key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>
    </article>
  )
}
