import styles from './ViewSkeleton.module.css'

const SIZE_CLASS = Object.freeze({ view: styles.view, detail: styles.detail })

/**
 * Suspense fallback with a fixed block size, so the real view replaces it without layout shift.
 * @param {{ size?: 'view' | 'detail', label?: string }} props
 */
export function ViewSkeleton({ size = 'view', label = 'Loading view' }) {
  const sizeClass = SIZE_CLASS[size] ?? styles.view
  return (
    <section
      className={`${styles.skeleton} ${sizeClass}`}
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <p className={styles.text}>{label}…</p>
      <span className={styles.bar} aria-hidden="true" />
      <span className={styles.bar} aria-hidden="true" />
      <span className={styles.barShort} aria-hidden="true" />
    </section>
  )
}
