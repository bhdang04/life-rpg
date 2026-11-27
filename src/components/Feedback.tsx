import { useEffect, useRef, useState } from 'react'
import { feedbackFor } from '../core/events'
import type { GameState } from '../core/missions'

// Floating "+50 XP" and a [System] toast after a change. Each plays once, never loops, never blocks taps.
export function Feedback({ state, onDayComplete }: { state: GameState; onDayComplete: () => void }) {
  const prev = useRef(state)
  const [gain, setGain] = useState<{ xp: number; id: number } | null>(null)
  const [toast, setToast] = useState<{ lines: string[]; id: number } | null>(null)

  useEffect(() => {
    const { xp, lines, dayComplete } = feedbackFor(prev.current, state)
    prev.current = state
    if (xp) setGain({ xp, id: Date.now() })
    if (lines.length) setToast({ lines, id: Date.now() })
    if (dayComplete) onDayComplete()
  }, [state])

  useEffect(() => {
    if (!gain) return
    const t = setTimeout(() => setGain(null), 900)
    return () => clearTimeout(t)
  }, [gain])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <>
      {gain && <div key={gain.id} className={gain.xp < 0 ? 'gain loss' : 'gain'}>{gain.xp > 0 ? '+' : ''}{gain.xp} XP</div>}
      {toast && <div key={toast.id} className="toast" role="status">{toast.lines.map((l) => <p key={l}>{l}</p>)}</div>}
    </>
  )
}
