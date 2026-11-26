import { useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { AppealContext } from './AppealContext.js'
import { AppealField } from './AppealField.jsx'
import { DossierApiError, postAppeal } from './dossierApi.js'
import { INITIAL_APPEAL_VALUES, isAppealValid, validateAppeal } from './validateAppeal.js'
import styles from './AppealForm.module.css'

/** @typedef {import('./appeal.contract.js').AppealReceipt} AppealReceipt */

const NETWORK_ERROR = 'Could not reach the server. Your appeal was not sent; try again.'

/**
 * The appeal form. State holds only the raw inputs. Errors and validity are derived in the same
 * render pass, so one keystroke is one render. They are shown after a field was left or a submit
 * was tried; a failed submit moves focus to the first invalid field. The client validates for
 * speed, the server validates again. Nothing is sent twice: a submit while one is in flight is
 * ignored. The fields stay enabled while sending (a disabled field would lose focus).
 * @param {{ playerId: string, onSubmitted: (receipt: AppealReceipt) => void }} props
 */
export function AppealForm({ playerId, onSubmitted }) {
  const headingId = useId()
  const [values, setValues] = useState(INITIAL_APPEAL_VALUES)
  const [touched, setTouched] = useState(() => ({}))
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState(/** @type {string | null} */ (null))
  const busyRef = useRef(false)

  const errors = validateAppeal(values)
  const valid = isAppealValid(errors)
  const errorCount = Object.keys(errors).length

  const contextValue = {
    values,
    errors,
    isErrorVisible: (name) => submitAttempted || touched[name] === true,
    setField: (name, value) => setValues((prev) => ({ ...prev, [name]: value })),
    markTouched: (name) => setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true })),
  }

  /** @param {import('react').FormEvent<HTMLFormElement>} event */
  async function handleSubmit(event) {
    event.preventDefault()
    if (busyRef.current) return
    const form = event.currentTarget
    if (!valid) {
      flushSync(() => setSubmitAttempted(true))
      form.querySelector('[aria-invalid="true"]')?.focus()
      return
    }
    busyRef.current = true
    setBusy(true)
    setSubmitError(null)
    try {
      onSubmitted(await postAppeal(playerId, values))
    } catch (err) {
      setSubmitError(err instanceof DossierApiError ? err.message : NETWORK_ERROR)
      busyRef.current = false
      setBusy(false)
    }
  }

  return (
    <section className={styles.form} aria-labelledby={headingId}>
      <h3 id={headingId}>File an appeal</h3>
      <AppealContext.Provider value={contextValue}>
        <form className={styles.fields} noValidate onSubmit={handleSubmit}>
          <AppealField name="contactEmail" label="Contact email" kind="email" />
          <AppealField name="category" label="Reason for the appeal" kind="select" />
          <AppealField name="statement" label="Your statement (50 to 1000 characters)" kind="textarea" />
          <AppealField name="confirmed" label="I confirm that this statement is accurate." kind="checkbox" />
          <p className={styles.actions}>
            <button type="submit" aria-disabled={busy}>
              {busy ? 'Sending...' : 'Submit appeal'}
            </button>
          </p>
        </form>
      </AppealContext.Provider>
      <output className={styles.status} role="status" aria-live="polite">
        {submitAttempted && !valid ? `${errorCount} field(s) need attention.` : ''}
      </output>
      {submitError && (
        <p className={styles.submitError} role="alert">
          {submitError}
        </p>
      )}
    </section>
  )
}
