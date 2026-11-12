import { useEffect, useId, useState } from 'react'
import { DB_FLOOR, toDecibels } from './levels.js'
import styles from './DrumMachine.module.css'

export function LevelMeter({ synth }) {
  const meterId = useId()
  const [level, setLevel] = useState(DB_FLOOR)

  useEffect(() => {
    let frameId = 0
    let samples = null
    const tick = () => {
      const analyser = synth.getAnalyser()
      let next = DB_FLOOR
      if (analyser) {
        if (!samples || samples.length !== analyser.fftSize) samples = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(samples)
        next = toDecibels(samples)
      }
      setLevel((prev) => (prev === next ? prev : next))
      frameId = window.requestAnimationFrame(tick)
    }
    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [synth])

  return (
    <p className={styles.meterRow}>
      <label htmlFor={meterId}>Output level</label>{' '}
      <meter id={meterId} min={-60} max={0} low={-18} high={-6} optimum={-30} value={level} />{' '}
      <span>{level} dBFS</span>
    </p>
  )
}
