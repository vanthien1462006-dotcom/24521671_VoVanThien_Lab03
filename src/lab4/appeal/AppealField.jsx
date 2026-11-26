import { useId } from 'react'
import { useAppealContext } from './AppealContext.js'
import { APPEAL_CATEGORIES, STATEMENT_MAX } from './validateAppeal.js'
import styles from './AppealField.module.css'

/**
 * One field of the appeal form. Value and error come from the form context by `name`; there is no
 * local state and no effect. The error is a text next to the field (`aria-describedby`), and the
 * field is `aria-invalid`, so it is never shown by colour alone.
 * @param {{
 *   name: 'contactEmail' | 'category' | 'statement' | 'confirmed',
 *   label: string,
 *   kind: 'email' | 'select' | 'textarea' | 'checkbox',
 * }} props
 */
export function AppealField({ name, label, kind }) {
  const id = useId()
  const errorId = `${id}-error`
  const counterId = `${id}-counter`
  const { values, errors, isErrorVisible, setField, markTouched } = useAppealContext()

  const error = isErrorVisible(name) ? errors[name] : undefined
  const describedBy = [error ? errorId : null, kind === 'textarea' ? counterId : null].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    name,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': describedBy,
    onBlur: () => markTouched(name),
  }

  let control
  if (kind === 'select') {
    control = (
      <select {...common} required value={String(values.category)} onChange={(event) => setField(name, event.target.value)}>
        <option value="">Choose a reason</option>
        {APPEAL_CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
    )
  } else if (kind === 'textarea') {
    control = (
      <textarea {...common} required rows={6} value={String(values.statement)} onChange={(event) => setField(name, event.target.value)} />
    )
  } else if (kind === 'checkbox') {
    control = (
      <input {...common} type="checkbox" required checked={values.confirmed === true} onChange={(event) => setField(name, event.target.checked)} />
    )
  } else {
    control = (
      <input
        {...common}
        type="email"
        required
        autoComplete="email"
        value={String(values.contactEmail)}
        onChange={(event) => setField(name, event.target.value)}
      />
    )
  }

  return (
    <p className={kind === 'checkbox' ? styles.checkField : styles.field}>
      {kind === 'checkbox' ? (
        <label htmlFor={id}>
          {control} {label}
        </label>
      ) : (
        <>
          <label htmlFor={id}>{label}</label>
          {control}
        </>
      )}
      {kind === 'textarea' && (
        <span id={counterId} className={styles.counter}>
          {values.statement.trim().length} / {STATEMENT_MAX} characters
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </p>
  )
}
