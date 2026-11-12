import { DeveloperCard } from './components/DeveloperCard.jsx'
import { ScientistDirectory } from './components/ScientistDirectory.jsx'
import { PubgMatchTelemetry } from './components/PubgMatchTelemetry.jsx'
import { DrumMachine } from './homeworks/DrumMachine/DrumMachine.jsx'
import { GrandPiano88 } from './homeworks/GrandPiano88/GrandPiano88.jsx'
import { SiteHeader } from './shell/SiteHeader.jsx'
import { useHashView } from './shell/useHashView.js'

function CurrentView({ view }) {
  if (view === 'hw1') return <DrumMachine />
  if (view === 'hw2') return <GrandPiano88 />
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
        <CurrentView view={view} />
      </main>
    </>
  )
}
