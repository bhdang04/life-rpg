import { useState, type CSSProperties } from 'react'
import { RANK_COLORS, STATS, type MissionDef, type Stat } from '../config/missions'
import { begin, type GameState } from '../core/missions'
import { levelProgress, rankFor, totalXp } from '../core/ranks'
import { History } from '../ui/History'
import { RankEmblem } from '../ui/RankEmblem'
import { RankPath } from '../ui/RankPath'
import { Ring } from '../ui/Ring'
import { StatDetail } from '../ui/StatDetail'

const C = 100 // radar center
const R = 80 // radar outer radius
const point = (i: number, r: number): [number, number] => {
  const a = (-90 + (360 / STATS.length) * i) * (Math.PI / 180)
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}
const poly = (r: (i: number) => number) => STATS.map((_, i) => point(i, r(i)).map((n) => n.toFixed(1)).join(',')).join(' ')

// Radar scales to the strongest stat (floor 100 so a fresh save is not a full shape).
function Radar({ xp }: { xp: number[] }) {
  const top = Math.max(100, ...xp)
  return (
    <svg viewBox="-20 0 240 200" width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }} role="img" aria-label={`Stat shape: ${STATS.map((s, i) => `${s.name} ${xp[i]} XP`).join(', ')}`}>
      {[0.33, 0.66, 1].map((k) => (
        <polygon key={k} points={poly(() => R * k)} fill="none" stroke="var(--border)" />
      ))}
      <polygon points={poly((i) => R * (xp[i] / top))} fill="rgba(167,139,250,0.35)" stroke="#c4b5fd" strokeWidth="2" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px #a78bfa)' }} />
      {STATS.map((s, i) => {
        const [x, y] = point(i, R * (xp[i] / top))
        return <circle key={s.id} cx={x} cy={y} r="4.5" fill={s.color} />
      })}
      {STATS.map((s, i) => {
        const [x, y] = point(i, R + 14)
        return <text key={s.id} x={x} y={y + 4} textAnchor="middle" className="display" fontSize="11" fontWeight="700" fill="#ece8ff">{s.name.slice(0, 3).toUpperCase()}</text>
      })}
    </svg>
  )
}

interface Props {
  state: GameState
  onChange: (fn: (s: GameState) => GameState) => void
  onCheckIn: () => void
}

export function Stats({ state, onChange, onCheckIn }: Props) {
  const [open, setOpen] = useState<Stat | null>(null)
  const xp = STATS.map((s) => state.statXp[s.id])
  const total = totalXp(state.statXp)
  const rank = rankFor(total)
  const lowest = STATS.reduce((a, b) => (state.statXp[b.id] < state.statXp[a.id] ? b : a))
  // Same start rules as the Board.
  const start = (m: MissionDef) => (m.kind === 'checkin' ? onCheckIn() : onChange((g) => begin(g, m.id, Date.now())))
  if (open) return <StatDetail stat={open} state={state} onBack={() => setOpen(null)} onStart={start} />
  return (
    <main>
      <header className="hdr sys" style={{ '--bracket': RANK_COLORS[rank] } as CSSProperties}>
        <RankEmblem rank={rank} />
        <div className="grow">
          <h1>Rank {rank}</h1>
          <p>{total} XP total</p>
        </div>
      </header>

      <section className="sys">
        <Radar xp={xp} />
        <div className="rings">
          {STATS.map((st) => {
            const { level, into, need } = levelProgress(state.statXp[st.id])
            return (
              <button key={st.id} className="tile" onClick={() => setOpen(st.id)} aria-label={`${st.name} details`}>
                <Ring level="" pct={into / need} color={st.color} label={`${st.name} level ${level}, ${into} of ${need} XP`} size={96} />
                <strong>{st.name}</strong>
                <small>{Math.round((into / need) * 100)}% to Lv {level + 1}</small>
              </button>
            )
          })}
        </div>
      </section>

      <RankPath total={total} />

      <History state={state} />

      <aside className="sys" style={{ marginTop: 'var(--gap)', padding: '12px 16px', '--bracket': lowest.color } as CSSProperties} aria-label="Focus">
        <small>FOCUS</small>
        <p style={{ margin: 0 }}>
          <b style={{ color: lowest.color }}>{lowest.name}</b> is your lowest stat. A {lowest.name} mission levels it fastest.
        </p>
      </aside>
    </main>
  )
}
