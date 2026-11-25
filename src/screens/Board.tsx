import { MISSIONS, type MissionDef } from '../config/missions'
import { completeTap, isDone, minutesFor, startMission, type GameState } from '../core/missions'
import { levelFor, rankFor, totalXp } from '../core/ranks'
import { streakMultiplier } from '../core/xp'

interface Props {
  state: GameState
  onChange: (fn: (s: GameState) => GameState) => void
  onCheckIn: () => void
}

const ACTION = { tap: 'Done', timed: 'Start', checkin: 'Check in' } as const

function Row({ m, state, onChange, onCheckIn }: { m: MissionDef } & Props) {
  const entry = state.log[m.id]
  const done = isDone(state, m.id)
  const detail =
    m.kind === 'timed' ? `${minutesFor(state, m.id)} min · ${m.tracker!.target} ${m.tracker!.label}` : m.kind === 'checkin' ? 'log once a day' : 'tap when done'
  return (
    <li>
      <span className="info">
        <strong>{m.name}</strong> +{m.xp} {m.stat} · {detail}
        {entry && !done && <em> · {entry.status} ({entry.xp} XP), retry allowed</em>}
      </span>
      {done ? (
        <span> ✓ +{entry.xp} XP</span>
      ) : (
        <button
          onClick={() =>
            m.kind === 'checkin' ? onCheckIn() : onChange((s) => (m.kind === 'tap' ? completeTap(s, m.id, Date.now()) : startMission(s, m.id, Date.now())))
          }
        >
          {ACTION[m.kind]}
        </button>
      )}
    </li>
  )
}

export function Board({ state, onChange, onCheckIn }: Props) {
  const open = MISSIONS.filter((m) => !isDone(state, m.id))
  const section = (title: string, list: MissionDef[]) => (
    <section>
      <h2>{title}</h2>
      {list.length === 0 ? <p>[System] No quests pending.</p> : <ul>{list.map((m) => <Row key={m.id} m={m} state={state} onChange={onChange} onCheckIn={onCheckIn} />)}</ul>}
    </section>
  )
  const xp = totalXp(state.statXp)
  return (
    <main>
      <header>
        <h1>Rank {rankFor(xp)} · {xp} XP · Lv {levelFor(xp)}</h1>
        <p>Streak {state.streak} (×{streakMultiplier(state.streak).toFixed(1)}) · {state.gold} gold</p>
      </header>
      {section('Daily Quests', open.filter((m) => m.required))}
      {section('Plan', open.filter((m) => !m.required))}
      {section('Completed', MISSIONS.filter((m) => isDone(state, m.id)))}
    </main>
  )
}
