import { useId } from 'react'
import { SAMPLE_DATA_NOTICE } from './arenaData.js'

/** Stub for H3-T15: heading and sample-data notice only. H3-T16 composes the arena. */
export function KraftonPubgVnArena() {
  const headingId = useId()
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>HW3 KRAFTON x PUBG Vietnam Airdrop Arena</h2>
      <p>{SAMPLE_DATA_NOTICE}</p>
    </section>
  )
}
