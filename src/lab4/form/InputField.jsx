import { useId } from 'react'
import { useFormContext } from './FormContext.js'
import styles from './InputField.module.css'

/**
 * Context-driven field: value and error come from the form context by `name`. No local state, no effect.
 * @param {{ name: 'name' | 'email' | 'age', label: string, type?: 'text' | 'email' | 'number', autoComplete?: string }} props
 */
export function InputField({ name, label, type = 'text', autoComplete = 'off' }) {
  const id = useId()
  const errorId = `${id}-error`
  const { values, errors, isErrorVisible, setField, markTouched } = useFormContext()

  const error = isErrorVisible(name) ? errors[name] : undefined
  const raw = values[name]
  const value = type === 'number' && Number.isNaN(raw) ? '' : raw

  function handleChange(event) {
    setField(name, type === 'number' ? event.target.valueAsNumber : event.target.value)
  }

  return (
    <p className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        required
        autoComplete={autoComplete}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        onChange={handleChange}
        onBlur={() => markTouched(name)}
      />
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </p>
  )
}
