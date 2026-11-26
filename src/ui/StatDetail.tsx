import type { CSSProperties } from 'react'
import { MISSIONS, STATS, type MissionDef, type Stat } from '../config/missions'
import { isDone, type GameState } from '../core/missions'
import { levelProgress } from '../core/ranks'
import { Ring } from './Ring'

interface Props {
  stat: Stat
  state: GameState
  onBack: () => void
  onStart: (m: MissionDef) => void
}

// One stat up close: ring, XP to next level, the missions that raise it, and a button for the next open one. No history (not stored).
export function StatDetail({ stat, state, onBack, onStart }: Props) {
  const st = STATS.find((s) => s.id === stat)!
  const { level, into, need } = levelProgress(state.statXp[stat])
  const missions = MISSIONS.filter((m) => m.stat === stat)
  const next = missions.find((m) => !isDone(state, m.id) && m.kind !== 'checkin')
  return (
    <main style={{ '--accent': st.color } as CSSProperties}>
      <button className="back" onClick={onBack}>‹ Stats</button>
      <section style={{ textAlign: 'center' }}>
        <Ring level={level} pct={into / need} color={st.color} label={`${st.name} level ${level}, ${into} of ${need} XP`} size={168} />
        <h1 className="display" style={{ letterSpacing: '0.08em' }}>{st.name.toUpperCase()}</h1>
        <p>{Math.round((into / need) * 100)}% to Level {level + 1} · {need - into} XP to go</p>
      </section>
      <section>
        <h2 className="display" style={{ color: st.color }}>RAISED BY</h2>
        <ul>
          {missions.map((m) => (
            <li key={m.id}>
              <span className="info"><strong>{m.name}</strong> {m.required ? 'Daily Quest' : m.kind === 'checkin' ? 'Check-in' : 'Bonus'}{isDone(state, m.id) && ' · done today'}</span>
              <span>+{m.xp} XP</span>
            </li>
          ))}
        </ul>
      </section>
      {next && <button style={{ width: '100%', minHeight: 56, background: st.color, color: '#1b0b3f', border: 0, fontWeight: 600 }} onClick={() => onStart(next)}>Start {next.name}</button>}
    </main>
  )
}
