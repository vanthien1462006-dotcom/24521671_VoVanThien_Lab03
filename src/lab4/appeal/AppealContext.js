import { createContext, useContext } from 'react'

/**
 * @typedef {Object} AppealContextValue
 * @property {import('./appeal.contract.js').AppealFormValues} values
 * @property {import('./appeal.contract.js').AppealFormErrors} errors   Derived in render by the provider.
 * @property {(name: keyof import('./appeal.contract.js').AppealFormValues) => boolean} isErrorVisible   True after the field was left or a submit was tried.
 * @property {(name: keyof import('./appeal.contract.js').AppealFormValues, value: string | boolean) => void} setField
 * @property {(name: keyof import('./appeal.contract.js').AppealFormValues) => void} markTouched
 */

/** @type {import('react').Context<AppealContextValue | null>} */
export const AppealContext = createContext(null)

/** @returns {AppealContextValue} */
export function useAppealContext() {
  const value = useContext(AppealContext)
  if (value === null) {
    throw new Error('useAppealContext must be used inside <AppealContext.Provider>')
  }
  return value
}
