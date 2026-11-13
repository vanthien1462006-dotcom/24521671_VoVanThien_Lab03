import { createContext, useContext } from 'react'

/**
 * @typedef {Object} FormContextValue
 * @property {import('./validateForm.js').FormValues} values
 * @property {import('./validateForm.js').FormErrors} errors   Derived in render by the provider.
 * @property {(name: string) => boolean} isErrorVisible   True after the field was left or a submit was tried.
 * @property {(name: string, value: string | number) => void} setField
 * @property {(name: string) => void} markTouched
 */

/** @type {import('react').Context<FormContextValue | null>} */
export const FormContext = createContext(null)

/** @returns {FormContextValue} */
export function useFormContext() {
  const value = useContext(FormContext)
  if (value === null) {
    throw new Error('useFormContext must be used inside <FormContext.Provider>')
  }
  return value
}
