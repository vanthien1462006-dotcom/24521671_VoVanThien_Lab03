import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { SiteHeader } from './SiteHeader.jsx'
import { ViewSkeleton } from './ViewSkeleton.jsx'

/** Shared layout route: the header stays mounted, child routes render in the Outlet. */
export function AppLayout() {
  return (
    <>
      <SiteHeader />
      <main>
        <Suspense fallback={<ViewSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  )
}
