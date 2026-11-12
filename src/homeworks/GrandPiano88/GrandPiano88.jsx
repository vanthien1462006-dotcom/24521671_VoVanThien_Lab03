import { useEffect, useId, useState } from 'react'
import { PolyphonicSynth } from './PolyphonicSynth.js'
import { PianoKey } from './PianoKey.jsx'
import { FIRST_MIDI, KEY_SLOTS, PIANO_KEYS } from './pianoKeys.js'
import styles from './GrandPiano88.module.css'

export function GrandPiano88() {
  const headingId = useId()
  const [synth] = useState(() => new PolyphonicSynth(8))
  const [pressedMidis, setPressedMidis] = useState(() => new Set())

  useEffect(() => () => synth.close(), [synth])

  function noteOn(midi) {
    const key = PIANO_KEYS[midi - FIRST_MIDI]
    synth.noteOn(midi, key.freqHz)
    setPressedMidis((prev) => (prev.has(midi) ? prev : new Set(prev).add(midi)))
  }

  function noteOff(midi) {
    synth.noteOff(midi)
    setPressedMidis((prev) => {
      if (!prev.has(midi)) return prev
      const next = new Set(prev)
      next.delete(midi)
      return next
    })
  }

  return (
    <section className={styles.piano} aria-labelledby={headingId}>
      <h2 id={headingId}>HW2 Polyphonic 88-Key Piano</h2>
      <section className={styles.keyboardScroll} aria-label="Piano keyboard" tabIndex={0}>
        <ul className={styles.keyboard}>
          {KEY_SLOTS.map((slot) => (
            <li key={slot.white.midi} className={styles.slot}>
              <PianoKey
                midi={slot.white.midi}
                noteName={slot.white.noteName}
                isBlack={false}
                isPressed={pressedMidis.has(slot.white.midi)}
                onNoteOn={noteOn}
                onNoteOff={noteOff}
              />
              {slot.black && (
                <PianoKey
                  midi={slot.black.midi}
                  noteName={slot.black.noteName}
                  isBlack
                  isPressed={pressedMidis.has(slot.black.midi)}
                  onNoteOn={noteOn}
                  onNoteOff={noteOff}
                />
              )}
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}
