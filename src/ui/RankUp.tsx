import { useEffect } from 'react'
import { RANK_COLORS } from '../config/missions'
import { nextRank } from '../core/ranks'
import { Burst } from './Burst'
import { buzz } from './motion'
import { RankEmblem } from './RankEmblem'

export interface RankUpInfo { from: string; to: string }

// Full-screen rank-up card. Reuses the LevelUp card's CSS; the rank color comes from RANK_COLORS.
export function RankUp({ info, total, onClose }: { info: RankUpInfo; total: number; onClose: () => void }) {
  const next = nextRank(total)
  useEffect(() => buzz([30, 50, 60, 50, 90]), [])
  return (
    <div role="dialog" aria-modal="true" aria-label={`Rank ${info.to} reached`} className="levelup">
      <Burst />
      <small style={{ color: RANK_COLORS[info.to], letterSpacing: '0.3em' }}>[SYSTEM]</small>
      <h1 className="display">RANK UP</h1>
      <div className="pulse"><RankEmblem rank={info.to} size={200} /></div>
      <p className="display" style={{ fontSize: '1.4rem', margin: 0 }}><span style={{ color: 'var(--text-dim)' }}>{info.from}</span> → {info.to}</p>
      <p style={{ margin: 0 }}>{next ? `Next: rank ${next.rank} at ${next.minXp} XP` : 'Max rank'}</p>
      <button className="go" onClick={onClose}>Continue</button>
    </div>
  )
}
