import { useState, type ReactNode } from 'react'
import { checkIn, isDone, type GameState } from '../core/missions'
import { moneyXp, moodXp, sleepXp } from '../core/xp'

interface Props {
  state: GameState
  onChange: (fn: (s: GameState) => GameState) => void
}

function Form({ id, title, state, onChange, label, valid, xp, note, extra }: Props & {
  extra?: ReactNode
  id: string
  title: string
  label: string
  valid: (n: number) => boolean
  xp: (n: number) => number
  note: (n: number) => string
}) {
  const [value, setValue] = useState('')
  const entry = state.log[id]
  if (isDone(state, id)) return <li><strong>{title}</strong> ✓ {entry.note} · +{entry.xp} XP</li>
  const n = value.trim() === '' ? NaN : Number(value)
  return (
    <li>
      <strong>{title}</strong>
      <label> {label} <input type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} /></label>
      {extra}
      <button disabled={!valid(n)} onClick={() => onChange((s) => checkIn(s, id, xp(n), note(n), Date.now()))}>Log</button>
    </li>
  )
}

export function CheckIn({ state, onChange }: Props) {
  const budget = state.settings.budget
  const [energy, setEnergy] = useState('3')
  return (
    <main>
      <h1>Check-in</h1>
      <ul>
        <Form id="sleep" title="Sleep" label="hours" state={state} onChange={onChange}
          valid={(n) => n > 0 && n <= 24} xp={sleepXp} note={(n) => `${n}h`} />
        <Form id="mood" title="Mood + Energy" label="mood 1-5" state={state} onChange={onChange}
          valid={(n) => [n, Number(energy)].every((v) => Number.isInteger(v) && v >= 1 && v <= 5)} xp={moodXp} note={(n) => `mood ${n}, energy ${energy}`}
          extra={<label>energy 1-5 <input type="number" min={1} max={5} value={energy} onChange={(e) => setEnergy(e.target.value)} /></label>} />
        <Form id="money" title="Money" label={`spent today (budget ${budget})`} state={state} onChange={onChange}
          valid={(n) => n >= 0} xp={(n) => moneyXp(n, budget)} note={(n) => `${n} / ${budget}`} />
      </ul>
    </main>
  )
}
