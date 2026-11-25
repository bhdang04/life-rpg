import { useState } from 'react'
import { MISSIONS } from '../config/missions'
import type { GameState } from '../core/missions'
import { exportJSON } from '../store/storage'

interface Props {
  state: GameState
  onChange: (fn: (s: GameState) => GameState) => void
}

export function Settings({ state, onChange }: Props) {
  const [copied, setCopied] = useState<'idle' | 'ok' | 'failed'>('idle')
  const json = exportJSON(state)
  // Ignores empty or invalid input so a half-typed value never reaches the saved settings.
  const num = (v: string, min: number) => (v.trim() !== '' && Number(v) >= min ? Number(v) : null)
  const copy = () =>
    navigator.clipboard.writeText(json).then(() => setCopied('ok'), () => setCopied('failed'))
  return (
    <main>
      <h1>Settings</h1>
      <h2>Daily budget</h2>
      <input type="number" inputMode="decimal" defaultValue={state.settings.budget}
        onChange={(e) => { const b = num(e.target.value, 0); if (b !== null) onChange((s) => ({ ...s, settings: { ...s.settings, budget: b } })) }} />
      <h2>Timers (minutes, apply to the next start)</h2>
      <ul>
        {MISSIONS.filter((m) => m.kind === 'timed').map((m) => (
          <li key={m.id}>
            <label>{m.name} <input type="number" min={1} defaultValue={state.settings.minutes[m.id]}
              onChange={(e) => { const v = num(e.target.value, 1); if (v !== null) onChange((s) => ({ ...s, settings: { ...s.settings, minutes: { ...s.settings.minutes, [m.id]: v } } })) }} /></label>
          </li>
        ))}
      </ul>
      <h2>Backup</h2>
      <button onClick={copy}>Copy JSON</button> {copied === 'ok' && 'Copied.'}
      {copied === 'failed' && (
        <>
          <p>Clipboard blocked. Select and copy this by hand:</p>
          <textarea readOnly rows={8} value={json} onFocus={(e) => e.target.select()} />
        </>
      )}
      {/* shortcut: backup is copy-only, no import, add a paste-to-restore button if a phone ever loses its data */}
    </main>
  )
}
