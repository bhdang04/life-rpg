import { MISSIONS, type Stat } from '../config/missions'
import type { GameState, LogEntry } from './missions'
import { dayKey, isDayComplete } from './streak'

export const logXp = (log: Record<string, LogEntry>) => Object.values(log).reduce((a, e) => a + e.xp, 0)

// Net XP per stat for one day. Missions no longer in the config are skipped.
export function xpByStat(log: Record<string, LogEntry>): Partial<Record<Stat, number>> {
  const out: Partial<Record<Stat, number>> = {}
  for (const [id, e] of Object.entries(log)) {
    const m = MISSIONS.find((m) => m.id === id)
    if (m && e.xp) out[m.stat] = (out[m.stat] ?? 0) + e.xp
  }
  return out
}

export type DayStatus = 'complete' | 'partial' | 'none'
export interface DayCell {
  day: string
  status: DayStatus
  xp: number
}

// The last n days, oldest first, ending today. A day with no saved log (skipped, or before the app) is 'none'.
// shortcut: history is only written at rollover, so days before the first save show as empty, fine for V1
export function recentDays(s: GameState, n: number): DayCell[] {
  const [y, m, d] = s.day.split('-').map(Number)
  return Array.from({ length: n }, (_, i) => {
    const day = dayKey(new Date(y, m - 1, d - (n - 1 - i)))
    const log = day === s.day ? s.log : (s.history[day] ?? {})
    const status = isDayComplete(log) ? 'complete' : Object.values(log).some((e) => e.status === 'done') ? 'partial' : 'none'
    return { day, status, xp: logXp(log) }
  })
}
