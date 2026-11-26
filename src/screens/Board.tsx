import type { CSSProperties } from 'react'
import { MISSIONS, RANK_COLORS, type MissionDef } from '../config/missions'
import { completeTap, isDone, minutesFor, startMission, type GameState } from '../core/missions'
import { levelFor, levelProgress, rankFor, totalXp } from '../core/ranks'
import { streakMultiplier } from '../core/xp'
import { RankEmblem } from '../ui/RankEmblem'
import { Ring } from '../ui/Ring'

interface Props {
  state: GameState
  onChange: (fn: (s: GameState) => GameState) => void
  onCheckIn: () => void
}

const ACTION = { tap: 'Done', timed: 'Start', checkin: 'Check in' } as const

// Status icon, so state is never shown by color alone.
function Icon({ kind }: { kind: 'done' | 'next' | 'bad' | 'open' }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'row-icon', role: 'img' } as const
  if (kind === 'done')
    return (
      <svg {...p} stroke="#c4b5fd" aria-label="Done"><circle cx="12" cy="12" r="9" fill="rgba(167,139,250,0.25)" /><path d="M8 12.5l3 3 5-6" /></svg>
    )
  if (kind === 'next')
    return (
      <svg {...p} stroke="#ece8ff" aria-label="Next up"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" fill="#ece8ff" /></svg>
    )
  if (kind === 'bad')
    return (
      <svg {...p} stroke="var(--danger)" aria-label="Broken or expired"><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.01" /></svg>
    )
  return (
    <svg {...p} stroke="var(--text-dim)" aria-label="Not started"><circle cx="12" cy="12" r="9" /></svg>
  )
}

function Row({ m, state, act, next }: { m: MissionDef; state: GameState; act: (m: MissionDef) => void; next: boolean }) {
  const entry = state.log[m.id]
  const done = isDone(state, m.id)
  const broken = !!entry && !done
  const detail =
    m.kind === 'timed' ? `${minutesFor(state, m.id)} min · ${m.tracker!.target} ${m.tracker!.label}` : m.kind === 'checkin' ? 'log once a day' : 'tap when done'
  return (
    <li>
      <Icon kind={done ? 'done' : broken ? 'bad' : next ? 'next' : 'open'} />
      <span className="info">
        <strong>{m.name}</strong> +{m.xp} {m.stat} · {detail}
        {broken && <em> · {entry.status} ({entry.xp} XP), retry allowed</em>}
      </span>
      {done ? <span>+{entry.xp} XP</span> : <button onClick={() => act(m)}>{broken ? 'Retry' : ACTION[m.kind]}</button>}
    </li>
  )
}

export function Board({ state, onChange, onCheckIn }: Props) {
  const act = (m: MissionDef) =>
    m.kind === 'checkin' ? onCheckIn() : onChange((s) => (m.kind === 'tap' ? completeTap(s, m.id, Date.now()) : startMission(s, m.id, Date.now())))

  const xp = totalXp(state.statXp)
  const rank = rankFor(xp)
  const { into, need } = levelProgress(xp)
  const daily = MISSIONS.filter((m) => m.required)
  const open = MISSIONS.filter((m) => !isDone(state, m.id))
  // Next Up: the first unfinished daily quest, else the first unfinished bonus mission (check-ins have their own chips).
  const next = open.find((m) => m.required) ?? open.find((m) => m.kind !== 'checkin')
  const doneDaily = daily.length - daily.filter((m) => !isDone(state, m.id)).length
  const plan = open.filter((m) => !m.required && m.kind !== 'checkin')
  const checkins = open.filter((m) => m.kind === 'checkin')
  const completed = MISSIONS.filter((m) => isDone(state, m.id))
  const list = (items: MissionDef[]) =>
    items.length === 0 ? <p>[System] No quests pending.</p> : <ul>{items.map((m) => <Row key={m.id} m={m} state={state} act={act} next={m === next} />)}</ul>

  return (
    <main>
      <header className="hdr sys" style={{ '--bracket': RANK_COLORS[rank] } as CSSProperties}>
        <RankEmblem rank={rank} />
        <div className="grow">
          <h1>Rank {rank} · Lv {levelFor(xp)}</h1>
          <p>{xp} XP · {need - into} to next level</p>
          <div className="xpbar" role="progressbar" aria-label="XP to next level" aria-valuenow={into} aria-valuemin={0} aria-valuemax={need}>
            <i style={{ width: `${(into / need) * 100}%` }} />
          </div>
        </div>
        <div className="pills">
          <span className="pill">Streak {state.streak} ×{streakMultiplier(state.streak).toFixed(1)}</span>
          <span className="pill">{state.gold} gold</span>
        </div>
      </header>

      <section className="sys">
        <div className="daily-head">
          <Ring level={`${doneDaily}/${daily.length}`} pct={doneDaily / daily.length} color="#c4b5fd" label={`${doneDaily} of ${daily.length} daily quests done`} size={64} />
          <div>
            <h2 style={{ margin: 0 }}>Daily Quests</h2>
            <p>{doneDaily === daily.length ? 'All done. Streak is safe.' : `${daily.length - doneDaily} left to keep your streak`}</p>
          </div>
        </div>
        <ul>{daily.map((m) => <Row key={m.id} m={m} state={state} act={act} next={m === next} />)}</ul>
      </section>

      {checkins.length > 0 && (
        <div className="chips">
          {checkins.map((m) => <button key={m.id} onClick={() => act(m)}>{m.name}</button>)}
        </div>
      )}

      <details className="fold">
        <summary>Plan · {plan.length}</summary>
        {list(plan)}
      </details>
      <details className="fold">
        <summary>Completed · {completed.length}</summary>
        {list(completed)}
      </details>

      {next && (
        <aside className="next hero sys" aria-label="Next up">
          <div>
            <small>NEXT UP</small>
            <strong className="display">{next.name}</strong>
            <span>{next.kind === 'timed' ? `${minutesFor(state, next.id)} min · ` : ''}+{next.xp} XP</span>
          </div>
          <button className="go" onClick={() => act(next)}>{ACTION[next.kind]}</button>
        </aside>
      )}
    </main>
  )
}
