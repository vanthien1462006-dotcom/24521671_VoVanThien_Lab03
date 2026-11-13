import { useId, useState } from 'react'
import { flushSync } from 'react-dom'
import { FormContext } from './FormContext.js'
import { InputField } from './InputField.jsx'
import { ShowData } from './ShowData.jsx'
import { INITIAL_VALUES, isFormValid, validateForm } from './validateForm.js'
import styles from './SimpleForm.module.css'

/**
 * Context form engine. State holds only raw inputs. Errors and validity are derived in the
 * same render pass, so one keystroke is one render: no effect hook, no validation waterfall.
 */
export function SimpleForm() {
  const headingId = useId()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [touched, setTouched] = useState(() => ({}))
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitted, setSubmitted] = useState(null)

  const errors = validateForm(values)
  const isValid = isFormValid(errors)
  const errorCount = Object.keys(errors).length

  const contextValue = {
    values,
    errors,
    isErrorVisible: (name) => submitAttempted || touched[name] === true,
    setField: (name, value) => setValues((prev) => ({ ...prev, [name]: value })),
    markTouched: (name) => setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true })),
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!isValid) {
      flushSync(() => setSubmitAttempted(true))
      event.currentTarget.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    setSubmitted({ name: values.name.trim(), email: values.email.trim(), age: values.age })
  }

  function handleReset() {
    setValues(INITIAL_VALUES)
    setTouched({})
    setSubmitAttempted(false)
    setSubmitted(null)
  }

  return (
    <section className={styles.form} aria-labelledby={headingId}>
      <h2 id={headingId}>Pioneer Registration (Context Form Engine)</h2>
      <FormContext.Provider value={contextValue}>
        <form className={styles.fields} noValidate onSubmit={handleSubmit}>
          <InputField name="name" label="Full name" autoComplete="name" />
          <InputField name="email" label="Email" type="email" autoComplete="email" />
          <InputField name="age" label="Age (16 to 120)" type="number" />
          <p className={styles.actions}>
            <button type="submit">Submit</button>
            <button type="button" onClick={handleReset}>
              Reset
            </button>
          </p>
        </form>
      </FormContext.Provider>
      <output className={styles.status} role="status" aria-live="polite">
        {submitAttempted && !isValid ? `${errorCount} field(s) need attention.` : ''}
      </output>
      {submitted && <ShowData data={submitted} />}
    </section>
  )
}
