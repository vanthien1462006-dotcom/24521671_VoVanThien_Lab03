import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router'
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

// Exercise 1.1: the detail route is its own chunk (slide 9: React.lazy(() => import('./PersonDetail'))).
const PersonDetail = lazy(() => import('./lab4/people/PersonDetail.jsx'))
const SimpleForm = lazyNamed(() => import('./lab4/form/SimpleForm.jsx'), 'SimpleForm')
const ForumBoard = lazyNamed(() => import('./lab4/forum/ForumBoard.jsx'), 'ForumBoard')

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
          <Route path=":id" element={<PersonDetail people={SMART_PEOPLE} />} />
        </Route>
        <Route path="form" element={<SimpleForm />} />
        <Route path="forum">
          <Route index element={<Navigate to="nasa" replace />} />
          <Route path=":channelId" element={<ForumBoard />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
