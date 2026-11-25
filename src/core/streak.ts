import { MISSIONS } from '../config/missions'
import type { GameState, LogEntry } from './missions'

export const REQUIRED_IDS = MISSIONS.filter((m) => m.required).map((m) => m.id)

export function isDayComplete(log: Record<string, LogEntry>): boolean {
  return REQUIRED_IDS.every((id) => log[id]?.status === 'done')
}

// shortcut: day boundary is the device's local midnight, add a "day starts at" setting if late nights count as the previous day
export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

// Close out the stored day when a new day starts. Streak continues only if the previous
// day had every required mission done AND no days were skipped in between.
// shortcut: an active mission that spans midnight logs into the new day, fine for V1
export function rollover(s: GameState, today: string): GameState {
  const gap = daysBetween(s.day, today)
  if (gap <= 0) return s // same day, or clock moved backwards
  const streak = gap === 1 && isDayComplete(s.log) ? s.streak + 1 : 0
  return { ...s, streak, day: today, log: {}, history: { ...s.history, [s.day]: s.log } }
}
