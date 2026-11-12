import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { PolyphonicSynth } from './PolyphonicSynth.js'
import { PianoKey } from './PianoKey.jsx'
import { FIRST_MIDI, KEY_SLOTS, PIANO_KEYS } from './pianoKeys.js'
import { DEFAULT_OCTAVE, OCTAVES, computerKeyToMidi } from './computerKeyMap.js'
import { shouldHandleKey } from '../DrumMachine/shouldHandleKey.js'
import { createTakeRecorder } from './recorder.js'
import { REPLAY_SPEEDS, buildReplaySchedule, playSequence } from './replay.js'
import styles from './GrandPiano88.module.css'

const MAX_VOICES = 8

export function GrandPiano88() {
  const headingId = useId()
  const speedName = useId()
  const octaveId = useId()
  const kbId = useId()
  const [synth] = useState(() => new PolyphonicSynth(MAX_VOICES))
  const [pressedMidis, setPressedMidis] = useState(() => new Set())
  const [mode, setMode] = useState('idle')
  const [take, setTake] = useState([])
  const [speed, setSpeed] = useState(1)
  const [voiceCount, setVoiceCount] = useState(0)
  const [octave, setOctave] = useState(DEFAULT_OCTAVE)
  const [shortcutsOn, setShortcutsOn] = useState(true)
  const recorderRef = useRef(null)
  const replayRef = useRef(null)
  const playButtonRef = useRef(null)
  const stopButtonRef = useRef(null)

  useEffect(
    () => () => {
      replayRef.current?.abort()
      synth.close()
    },
    [synth],
  )

  const noteOn = useCallback(
    (midi) => {
      const key = PIANO_KEYS[midi - FIRST_MIDI]
      synth.noteOn(midi, key.freqHz)
      setVoiceCount(synth.activeCount)
      if (recorderRef.current?.isRecording()) recorderRef.current.noteOn(midi, key.freqHz)
      setPressedMidis((prev) => (prev.has(midi) ? prev : new Set(prev).add(midi)))
    },
    [synth],
  )

  const noteOff = useCallback(
    (midi) => {
      synth.noteOff(midi)
      setVoiceCount(synth.activeCount)
      if (recorderRef.current?.isRecording()) recorderRef.current.noteOff(midi)
      setPressedMidis((prev) => {
        if (!prev.has(midi)) return prev
        const next = new Set(prev)
        next.delete(midi)
        return next
      })
    },
    [synth],
  )

  useEffect(() => {
    if (!shortcutsOn || mode === 'playing') return undefined

    function handleKeyDown(e) {
      if (!shouldHandleKey(e, true)) return
      const midi = computerKeyToMidi(e.code, octave)
      if (midi === null) return
      e.preventDefault()
      noteOn(midi)
    }
    function handleKeyUp(e) {
      const midi = computerKeyToMidi(e.code, octave)
      if (midi === null) return
      noteOff(midi)
    }
    function releaseAll() {
      synth.stopAll()
      setPressedMidis(new Set())
      setVoiceCount(synth.activeCount)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', releaseAll)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', releaseAll)
      releaseAll()
    }
  }, [shortcutsOn, mode, octave, noteOn, noteOff, synth])

  function handleRecord() {
    if (mode === 'idle') {
      recorderRef.current ??= createTakeRecorder()
      recorderRef.current.start()
      setMode('recording')
    } else if (mode === 'recording') {
      setTake(recorderRef.current.stop())
      setMode('idle')
    }
  }

  async function handlePlay() {
    if (take.length === 0 || mode !== 'idle') return
    const controller = new AbortController()
    replayRef.current = controller
    // Update state first: focus() on a disabled button does nothing.
    flushSync(() => setMode('playing'))
    stopButtonRef.current?.focus()
    try {
      await playSequence(buildReplaySchedule(take, speed), {
        onNoteOn: noteOn,
        onNoteOff: noteOff,
        signal: controller.signal,
      })
    } catch (err) {
      if (err.name !== 'AbortError') throw err
    } finally {
      synth.stopAll()
      if (replayRef.current === controller) replayRef.current = null
      flushSync(() => {
        setPressedMidis(new Set())
        setVoiceCount(synth.activeCount)
        setMode('idle')
      })
      const active = document.activeElement
      if (active === document.body || active === stopButtonRef.current) {
        playButtonRef.current?.focus()
      }
    }
  }

  function handleStop() {
    replayRef.current?.abort()
  }

  let statusText = 'Ready'
  if (mode === 'recording') statusText = 'Recording'
  else if (mode === 'playing') statusText = `Playing take (${take.length} notes) at ${speed}x`
  else if (take.length > 0) statusText = `Take ready: ${take.length} notes`

  return (
    <section className={styles.piano} aria-labelledby={headingId}>
      <h2 id={headingId}>HW2 Polyphonic 88-Key Piano</h2>
      <p className={styles.controls}>
        <button
          type="button"
          onClick={handleRecord}
          disabled={mode === 'playing'}
          aria-pressed={mode === 'recording'}
        >
          {mode === 'recording' ? 'Stop recording' : 'Record'}
        </button>
        <button
          type="button"
          ref={playButtonRef}
          onClick={handlePlay}
          disabled={mode !== 'idle' || take.length === 0}
        >
          Play take
        </button>
        <button
          type="button"
          ref={stopButtonRef}
          onClick={handleStop}
          disabled={mode !== 'playing'}
        >
          Stop Sequence
        </button>
      </p>
      <fieldset>
        <legend>Replay speed</legend>
        {REPLAY_SPEEDS.map((s) => (
          <label key={s} htmlFor={`${speedName}-${s}`}>
            <input
              type="radio"
              id={`${speedName}-${s}`}
              name={speedName}
              value={s}
              checked={speed === s}
              onChange={() => setSpeed(s)}
            />{' '}
            {s}x
          </label>
        ))}
      </fieldset>
      <p className={styles.field}>
        <label htmlFor={octaveId}>Keyboard octave</label>
        <select id={octaveId} value={octave} onChange={(e) => setOctave(Number(e.target.value))}>
          {OCTAVES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </p>
      <p className={styles.field}>
        <input
          id={kbId}
          type="checkbox"
          checked={shortcutsOn}
          onChange={(e) => setShortcutsOn(e.target.checked)}
        />
        <label htmlFor={kbId}>Keyboard shortcuts (A W S E D F T G Y H U J K)</label>
      </p>
      <output className={styles.status} role="status" aria-live="polite">
        {statusText}. Voices: {voiceCount} of {MAX_VOICES}.
      </output>
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
