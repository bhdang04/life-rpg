import { useEffect } from 'react'
import { Burst } from './Burst'
import { buzz } from './motion'

export interface Pr { ex: string; w: number; r: number }

// Full-screen new-best card after a Gym finish. Reuses the LevelUp card's CSS; one line per exercise.
export function PrCard({ prs, onClose }: { prs: Pr[]; onClose: () => void }) {
  useEffect(() => buzz([30, 50, 60]), [])
  return (
    <div role="dialog" aria-modal="true" aria-label="New personal best" className="levelup">
      <Burst />
      <small style={{ color: 'var(--accent)', letterSpacing: '0.3em' }}>GYM</small>
      <h1 className="display">NEW BEST</h1>
      <ul className="daychips">
        {prs.map((p) => <li key={p.ex}>{p.ex} {p.w ? `${p.w} lb × ${p.r}` : `${p.r} reps`}</li>)}
      </ul>
      <button className="go" onClick={onClose}>Continue</button>
    </div>
  )
}
