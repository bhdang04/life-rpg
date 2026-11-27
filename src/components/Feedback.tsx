import { useEffect, useRef, useState } from 'react'
import { feedbackFor } from '../core/events'
import type { GameState } from '../core/missions'
import { buzz, reducedMotion } from '../ui/motion'

// Counts 0 -> to over `ms`, once. Shows the final number at once under reduce-motion.
function useCountUp(to: number, ms = 400) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (reducedMotion()) return setV(to)
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms)
      setV(Math.round(to * k))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, ms])
  return v
}

function Gain({ xp }: { xp: number }) {
  const v = useCountUp(xp)
  return <div className={xp < 0 ? 'gain loss' : 'gain'}>{v > 0 ? '+' : ''}{v} XP</div>
}

// Floating "+50 XP" after a change. Each plays once, never loops, never blocks taps.
export function Feedback({ state, onDayComplete }: { state: GameState; onDayComplete: () => void }) {
  const prev = useRef(state)
  const [gain, setGain] = useState<{ xp: number; id: number } | null>(null)

  useEffect(() => {
    const { xp, dayComplete } = feedbackFor(prev.current, state)
    prev.current = state
    if (xp && !dayComplete) setGain({ xp, id: Date.now() }) // the Day complete screen already shows the total
    // Later buzz replaces an earlier one, so the biggest moment goes last.
    if (xp > 0) buzz(15)
    if (xp < 0) buzz([40, 60, 40])
    if (dayComplete) {
      buzz([20, 40, 20, 40, 80])
      onDayComplete()
    }
  }, [state])

  useEffect(() => {
    if (!gain) return
    const t = setTimeout(() => setGain(null), 900)
    return () => clearTimeout(t)
  }, [gain])

  return gain ? <Gain key={gain.id} xp={gain.xp} /> : null
}
