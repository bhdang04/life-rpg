import type { GameState } from '../core/missions'
import { recentDays } from '../core/summary'

// Last 28 days as a grid. shortcut: not aligned to weekdays, add week columns if you want a calendar look
export function History({ state }: { state: GameState }) {
  const days = recentDays(state, 28)
  const week = days.slice(-7)
  const weekDone = week.filter((d) => d.status === 'complete').length
  return (
    <details className="fold">
      <summary>
        History <span>{weekDone}/7 days complete this week</span>
      </summary>
      <p style={{ padding: '8px 14px 0' }}>{week.reduce((a, d) => a + d.xp, 0)} XP in the last 7 days.</p>
      <div className="cal" role="list" aria-label="Last 28 days, oldest first">
        {days.map((d) => (
          <i key={d.day} role="listitem" className={d.status + (d.day === state.day ? ' today' : '')} title={`${d.day}: ${d.status}, ${d.xp} XP`} aria-label={`${d.day}: ${d.status}, ${d.xp} XP`} />
        ))}
      </div>
      <small style={{ display: 'block', padding: '0 14px 12px', color: 'var(--text-dim)' }}>Bright = all 4 daily quests. Dim = some done. Empty = none.</small>
    </details>
  )
}
