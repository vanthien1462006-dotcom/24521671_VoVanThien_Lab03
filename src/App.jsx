import { Route, Routes } from 'react-router'
import { DeveloperCard } from './components/DeveloperCard.jsx'
import { ScientistDirectory } from './components/ScientistDirectory.jsx'
import { PubgMatchTelemetry } from './components/PubgMatchTelemetry.jsx'
import { AppLayout } from './shell/AppLayout.jsx'
import { lazyNamed } from './shell/lazyNamed.js'
import { NotFoundPage } from './shell/NotFoundPage.jsx'
import { SMART_PEOPLE } from './data/smartPeople.js'
import { PeopleLayout } from './lab4/people/PeopleLayout.jsx'

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

function Lab3Exercises() {
  return (
    <>
      <DeveloperCard />
      <ScientistDirectory />
      <PubgMatchTelemetry />
    </>
  )
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Lab3Exercises />} />
        <Route path="hw1" element={<DrumMachine />} />
        <Route path="hw2" element={<GrandPiano88 />} />
        <Route path="hw3" element={<KraftonPubgVnArena />} />
        <Route path="bonus" element={<SituationshipAnalyzer />} />
        <Route path="people" element={<PeopleLayout people={SMART_PEOPLE} />}>
          <Route index element={<p>Select a pioneer to open the dossier.</p>} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
