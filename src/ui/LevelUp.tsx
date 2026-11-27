import { STATS, type Stat } from '../config/missions'
import { nextRank } from '../core/ranks'
import { useEffect } from 'react'
import { Burst } from './Burst'
import { buzz } from './motion'
import { Ring } from './Ring'

export interface LevelUpInfo { stat: Stat; from: number; to: number }

// Full-screen level-up card. No gold reward shown: the game has none per level (gold comes from XP only).
export function LevelUp({ info, total, onClose }: { info: LevelUpInfo; total: number; onClose: () => void }) {
  const st = STATS.find((s) => s.id === info.stat)!
  const next = nextRank(total)
  useEffect(() => buzz([20, 40, 60]), [])
  return (
    <div role="dialog" aria-modal="true" aria-label={`${st.name} level up`} className="levelup">
      <Burst />
      <small style={{ color: st.color, letterSpacing: '0.3em' }}>{st.name.toUpperCase()}</small>
      <h1 className="display">LEVEL UP</h1>
      <div className="pulse"><Ring level={info.to} pct={1} color={st.color} label={`${st.name} level ${info.to}, ring full`} size={200} /></div>
      <p className="display" style={{ fontSize: '1.4rem', margin: 0 }}><span style={{ color: 'var(--text-dim)' }}>{info.from}</span> → {info.to}</p>
      <p style={{ margin: 0 }}>{next ? `Rank XP ${total} / ${next.minXp}` : `Rank XP ${total} (max rank)`}</p>
      <button className="go" onClick={onClose}>Continue</button>
    </div>
  )
}
