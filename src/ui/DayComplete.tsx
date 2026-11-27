import { STATS } from '../config/missions'
import type { GameState } from '../core/missions'
import { logXp, xpByStat } from '../core/summary'
import { streakMultiplier } from '../core/xp'
import { Ring } from './Ring'

// Full-screen summary once all required quests are done. It ends the day on purpose: nothing here asks you to keep going.
export function DayComplete({ state, onClose }: { state: GameState; onClose: () => void }) {
  const byStat = xpByStat(state.log)
  const streak = state.streak + 1 // today counts once the day rolls over
  return (
    <div role="dialog" aria-modal="true" aria-label="Day complete" className="levelup">
      <small style={{ color: 'var(--accent)', letterSpacing: '0.3em' }}>DAILY QUESTS</small>
      <h1 className="display">DAY COMPLETE</h1>
      <div className="pulse"><Ring level="✓" pct={1} color="#a78bfa" label="All daily quests complete" size={160} /></div>
      <p className="display" style={{ fontSize: '1.6rem', margin: 0 }}>+{logXp(state.log)} XP</p>
      <ul className="daychips">
        {STATS.filter((s) => byStat[s.id]).map((s) => (
          <li key={s.id} style={{ color: s.color }}>{s.name} {byStat[s.id]! > 0 ? '+' : ''}{byStat[s.id]}</li>
        ))}
      </ul>
      <p style={{ margin: 0 }}>Streak {streak} {streak === 1 ? 'day' : 'days'} · tomorrow ×{streakMultiplier(streak).toFixed(1)} XP</p>
      <p style={{ margin: 0 }}>[System] Good place to stop. New quests unlock at midnight.</p>
      <button className="go" onClick={onClose}>Continue</button>
    </div>
  )
}
