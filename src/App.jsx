import { Suspense } from 'react'
import { DeveloperCard } from './components/DeveloperCard.jsx'
import { ScientistDirectory } from './components/ScientistDirectory.jsx'
import { PubgMatchTelemetry } from './components/PubgMatchTelemetry.jsx'
import { SiteHeader } from './shell/SiteHeader.jsx'
import { useHashView } from './shell/useHashView.js'
import { lazyNamed } from './shell/lazyNamed.js'
import { ViewSkeleton } from './shell/ViewSkeleton.jsx'

const DrumMachine = lazyNamed(() => import('./homeworks/DrumMachine/DrumMachine.jsx'), 'DrumMachine')
const GrandPiano88 = lazyNamed(() => import('./homeworks/GrandPiano88/GrandPiano88.jsx'), 'GrandPiano88')
const KraftonPubgVnArena = lazyNamed(
  () => import('./homeworks/KraftonPubgVnArena/KraftonPubgVnArena.jsx'),
  'KraftonPubgVnArena',
)
const SituationshipAnalyzer = lazyNamed(
  () => import('./homeworks/BonusSituationship/SituationshipAnalyzer.jsx'),
  'SituationshipAnalyzer',
)

function CurrentView({ view }) {
  if (view === 'hw1') return <DrumMachine />
  if (view === 'hw2') return <GrandPiano88 />
  if (view === 'hw3') return <KraftonPubgVnArena />
  if (view === 'bonus') return <SituationshipAnalyzer />
  return (
    <>
      <DeveloperCard />
      <ScientistDirectory />
      <PubgMatchTelemetry />
    </>
  )
}

export function App() {
  const view = useHashView()
  return (
    <>
      <SiteHeader view={view} />
      <main>
        <Suspense fallback={<ViewSkeleton />}>
          <CurrentView view={view} />
        </Suspense>
      </main>
    </>
  )
}
