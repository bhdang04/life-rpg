import { RANKS, XP_PER_LEVEL, type Stat } from '../config/missions'

// shortcut: linear 100 XP per level, upgrade to a curve if leveling feels too fast after a few weeks
export function levelFor(xp: number): number {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1
}

export function levelProgress(xp: number): { level: number; into: number; need: number } {
  const safe = Math.max(0, xp)
  return { level: levelFor(safe), into: safe % XP_PER_LEVEL, need: XP_PER_LEVEL }
}

export function totalXp(statXp: Record<Stat, number>): number {
  return Object.values(statXp).reduce((a, b) => a + b, 0)
}

export function rankFor(total: number): string {
  return [...RANKS].reverse().find((r) => total >= r.minXp)!.rank
}

export function nextRank(total: number): { rank: string; minXp: number } | null {
  return RANKS.find((r) => total < r.minXp) ?? null
}
