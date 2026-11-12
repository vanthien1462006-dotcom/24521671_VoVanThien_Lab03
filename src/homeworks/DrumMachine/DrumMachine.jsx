import { useCallback, useEffect, useId, useState } from 'react'
import { DRUM_PADS, PAD_BY_CODE } from './drumPads.js'
import { createDrumSynth } from './drumSynth.js'
import { useDrumKeyboard } from './useDrumKeyboard.js'
import { LevelMeter } from './LevelMeter.jsx'
import styles from './DrumMachine.module.css'

export function DrumMachine() {
  const headingId = useId()
  const [synth] = useState(() => createDrumSynth())
  const [activePadIds, setActivePadIds] = useState(() => new Set())
  const [hits, setHits] = useState([])
  const [totalHits, setTotalHits] = useState(0)

  useEffect(() => () => synth.close(), [synth])

  const triggerPad = useCallback(
    (padId) => {
      const pad = DRUM_PADS.find((p) => p.id === padId)
      if (!pad) return
      synth.play(pad.recipe)
      const hit = { id: crypto.randomUUID(), padId: pad.id, label: pad.label, keyLabel: pad.keyLabel }
      setHits((prev) => [hit, ...prev].slice(0, 8))
      setTotalHits((n) => n + 1)
      setActivePadIds((prev) => (prev.has(padId) ? prev : new Set(prev).add(padId)))
    },
    [synth],
  )

  const releasePad = useCallback((padId) => {
    setActivePadIds((prev) => {
      if (!prev.has(padId)) return prev
      const next = new Set(prev)
      next.delete(padId)
      return next
    })
  }, [])

  useDrumKeyboard(PAD_BY_CODE, triggerPad, true, releasePad)

  return (
    <section className={styles.drumKit} aria-labelledby={headingId}>
      <h2 id={headingId}>HW1 Production Studio Drum Kit</h2>
      <p>Play with the keys W, A, S, D, J, K, L or press a pad.</p>
      <ul className={styles.pads} aria-label="Drum pads">
        {DRUM_PADS.map((pad) => (
          <li key={pad.id}>
            <button
              type="button"
              className={styles.pad}
              aria-pressed={activePadIds.has(pad.id)}
              aria-keyshortcuts={pad.keyLabel}
              onPointerDown={() => triggerPad(pad.id)}
              onPointerUp={() => releasePad(pad.id)}
              onPointerLeave={() => releasePad(pad.id)}
              onPointerCancel={() => releasePad(pad.id)}
              onClick={(e) => {
                if (e.detail === 0) {
                  triggerPad(pad.id)
                  releasePad(pad.id)
                }
              }}
            >
              <span className={styles.padLabel}>{pad.label}</span>{' '}
              <kbd className={styles.padKey}>{pad.keyLabel}</kbd>
            </button>
          </li>
        ))}
      </ul>
      <LevelMeter synth={synth} />
      <output className={styles.hitStatus} role="status" aria-live="polite">
        {hits.length === 0
          ? 'No hits yet.'
          : `Last hit: ${hits[0].label} (${hits[0].keyLabel}). Total hits: ${totalHits}.`}
      </output>
      <h3>Hit history</h3>
      <ol className={styles.hitLog} aria-label="Last 8 hits, newest first">
        {hits.map((h) => (
          <li key={h.id}>
            {h.label} ({h.keyLabel})
          </li>
        ))}
      </ol>
    </section>
  )
}
