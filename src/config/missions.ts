// All game data lives here. Adding or tuning a mission = editing this file, not code.

export type Stat = 'body' | 'craft' | 'mind' | 'discipline' | 'money'
export type MissionKind = 'timed' | 'tap' | 'checkin'

export interface MissionDef {
  id: string
  name: string
  kind: MissionKind
  xp: number // base XP (max XP for check-ins)
  stat: Stat
  required: boolean // all required done = day counts toward streak
  minutes?: number // timed only: default timer, editable in Settings
  tracker?: { label: string; target: number } // timed only: hit target before time runs out
}

export const MISSIONS: MissionDef[] = [
  { id: 'gym', name: 'Gym', kind: 'tap', xp: 50, stat: 'body', required: true },
  { id: 'work', name: 'Work Block', kind: 'timed', xp: 60, stat: 'craft', required: true, minutes: 60, tracker: { label: 'block', target: 1 } },
  { id: 'reading', name: 'Reading', kind: 'timed', xp: 30, stat: 'mind', required: true, minutes: 30, tracker: { label: 'pages', target: 20 } },
  { id: 'filming', name: 'Filming Content', kind: 'tap', xp: 50, stat: 'craft', required: true },
  { id: 'leetcode', name: 'LeetCode', kind: 'timed', xp: 50, stat: 'craft', required: false, minutes: 45, tracker: { label: 'problems', target: 2 } },
  { id: 'jobapps', name: 'Job Apps', kind: 'timed', xp: 40, stat: 'money', required: false, minutes: 30, tracker: { label: 'applications', target: 5 } },
  { id: 'sleep', name: 'Sleep', kind: 'checkin', xp: 30, stat: 'body', required: false },
  { id: 'mood', name: 'Mood + Energy', kind: 'checkin', xp: 10, stat: 'discipline', required: false },
  { id: 'money', name: 'Money', kind: 'checkin', xp: 20, stat: 'money', required: false },
]

export const STATS: { id: Stat; name: string; color: string }[] = [
  { id: 'body', name: 'Body', color: '#f87171' },
  { id: 'craft', name: 'Craft', color: '#60a5fa' },
  { id: 'mind', name: 'Mind', color: '#4ade80' },
  { id: 'discipline', name: 'Discipline', color: '#a78bfa' },
  { id: 'money', name: 'Money', color: '#fbbf24' },
]

export const XP_PER_LEVEL = 100
// Overall rank by total XP across all stats.
export const RANKS = [
  { rank: 'E', minXp: 0 },
  { rank: 'D', minXp: 1000 },
  { rank: 'C', minXp: 3000 },
  { rank: 'B', minXp: 7000 },
  { rank: 'A', minXp: 15000 },
  { rank: 'S', minXp: 30000 },
] as const

// Accent color per overall rank. The rank emblem and rank path change color as you rank up.
export const RANK_COLORS: Record<string, string> = {
  E: '#94a3b8',
  D: '#4ade80',
  C: '#38bdf8',
  B: '#a78bfa',
  A: '#fbbf24',
  S: '#f43f5e',
}

export const STREAK_BONUS_PER_DAY = 0.1
export const STREAK_BONUS_CAP = 0.5
export const BREAK_PENALTY = 5
export const XP_PER_GOLD = 10
export const DEFAULT_BUDGET = 20
export const SLEEP_FULL_MIN = 7
export const SLEEP_FULL_MAX = 9

export const missionById = (id: string): MissionDef => {
  const m = MISSIONS.find((m) => m.id === id)
  if (!m) throw new Error(`Unknown mission: ${id}`)
  return m
}
