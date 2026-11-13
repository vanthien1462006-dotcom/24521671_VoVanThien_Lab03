import { useId } from 'react'
import { Link, useLocation } from 'react-router'

/** Catch-all route (path="*"). The bad path is rendered as text, never as markup. */
export function NotFoundPage() {
  const headingId = useId()
  const { pathname } = useLocation()
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>404: Page Not Found</h2>
      <p role="alert">
        No route matches <code>{pathname}</code>.
      </p>
      <p>
        <Link to="/">Back to the home page</Link>
      </p>
    </section>
  )
}
