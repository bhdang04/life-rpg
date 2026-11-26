import { useState } from 'react'
import { finishWorkout, type GameState } from '../core/missions'
import { plan } from '../core/overload'

interface Props {
  state: GameState
  onChange: (fn: (s: GameState) => GameState) => void
  onBack: () => void
}

const SPLITS = ['Push', 'Pull', 'Legs', 'Upper']
type Row = { w: string; r: [string, string] }

// shortcut: default is "not what you did last", fits a Push/Pull rotation, add a real schedule if Legs comes back
function nextSplit(workouts: GameState['workouts']) {
  const last = Object.keys(workouts).sort().pop()
  return last && workouts[last].split === 'Push' ? 'Pull' : 'Push'
}

export function Gym({ state, onChange, onBack }: Props) {
  const [split, setSplit] = useState(() => nextSplit(state.workouts))
  const rows = plan(state.workouts, split)
  const [vals, setVals] = useState<Record<string, Row>>({})
  const get = (ex: string, w: number): Row => vals[ex + split] ?? { w: String(w), r: ['', ''] }
  const set = (ex: string, w: number, fn: (r: Row) => Row) => setVals((v) => ({ ...v, [ex + split]: fn(get(ex, w)) }))

  // One entry per set, like the Daily HQ history; an exercise with a blank or invalid set is skipped.
  const entries = rows.flatMap(({ ex, target }) => {
    const v = get(ex, target.w)
    const w = Number(v.w)
    const r = v.r.map((x) => (x.trim() === '' ? NaN : Number(x)))
    return v.w.trim() !== '' && w >= 0 && r.every((n) => Number.isInteger(n) && n > 0) ? r.map((n) => ({ ex, w, r: n, s: 1 })) : []
  })

  return (
    <main>
      <button className="back" onClick={onBack}>← Back</button>
      <h1>Gym</h1>
      <div className="splits">
        {SPLITS.map((s) => (
          <button key={s} aria-pressed={s === split} onClick={() => setSplit(s)}>{s}</button>
        ))}
      </div>
      {rows.length === 0 && <p>No past {split} session to copy.</p>}
      <ul>
        {rows.map(({ ex, last, target }) => {
          const v = get(ex, target.w)
          return (
            <li key={ex} className="lift">
              <strong className="display">{ex}</strong>
              <div className="last">last: {last.w} × {last.reps.join(', ')}</div>
              <div className="target">target: {target.w} × {target.r}</div>
              <div className="sets">
              <label>lb <input type="number" inputMode="decimal" value={v.w} onChange={(e) => set(ex, target.w, (x) => ({ ...x, w: e.target.value }))} /></label>
              <label>reps
                {[0, 1].map((i) => (
                  <input key={i} type="number" inputMode="numeric" aria-label={`set ${i + 1} reps`} placeholder={String(target.r)} value={v.r[i]}
                    onChange={(e) => set(ex, target.w, (x) => ({ ...x, r: i ? [x.r[0], e.target.value] : [e.target.value, x.r[1]] }))} />
                ))}
              </label>
              </div>
            </li>
          )
        })}
      </ul>
      <button className="finish" disabled={entries.length === 0} onClick={() => { onChange((s) => finishWorkout(s, s.day, { split, entries }, Date.now())); onBack() }}>
        Finish · +50 XP
      </button>
    </main>
  )
}
