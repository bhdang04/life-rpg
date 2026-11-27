import { BREAK_PENALTY, DEFAULT_BUDGET, MISSIONS, STATS, missionById, type Stat } from '../config/missions'
import { earn, penalize } from './xp'

export type Outcome = 'done' | 'broken' | 'expired'
export interface LogEntry {
  status: Outcome
  xp: number // XP gained (negative = penalty)
  at: number
  note?: string // check-in values, e.g. "7.5h"
}
export interface ActiveMission {
  id: string
  startedAt: number
  endsAt: number
  count: number
}
export interface GameState {
  version: 1
  settings: { budget: number; minutes: Record<string, number> }
  statXp: Record<Stat, number>
  gold: number
  goldCarry: number // XP not yet turned into gold
  streak: number // consecutive completed days before today
  day: string // YYYY-MM-DD that `log` belongs to
  log: Record<string, LogEntry> // today's outcome per mission id
  active: ActiveMission | null
  // shortcut: past day logs kept forever (shown in Stats > History), add pruning if the save grows large
  history: Record<string, Record<string, LogEntry>>
  workouts: Record<string, Workout> // gym sessions by date
}

export interface Workout {
  split: string
  entries: { ex: string; w: number; r: number; s: number }[]
}

export function newState(today: string): GameState {
  return {
    version: 1,
    settings: {
      budget: DEFAULT_BUDGET,
      minutes: Object.fromEntries(MISSIONS.filter((m) => m.minutes).map((m) => [m.id, m.minutes!])),
    },
    statXp: Object.fromEntries(STATS.map((s) => [s.id, 0])) as Record<Stat, number>,
    gold: 0,
    goldCarry: 0,
    streak: 0,
    day: today,
    log: {},
    active: null,
    history: {},
    workouts: {},
  }
}

export const isDone = (s: GameState, id: string) => s.log[id]?.status === 'done'

export const minutesFor = (s: GameState, id: string) => s.settings.minutes[id] ?? missionById(id).minutes ?? 0

export function startMission(s: GameState, id: string, now: number): GameState {
  const m = missionById(id)
  if (m.kind !== 'timed' || s.active || isDone(s, id)) return s
  return { ...s, active: { id, startedAt: now, endsAt: now + minutesFor(s, id) * 60_000, count: 0 } }
}

// Timer ran out before the tracker target was hit: 0 XP.
export function expireIfDue(s: GameState, now: number): GameState {
  if (!s.active || now < s.active.endsAt) return s
  return { ...s, active: null, log: { ...s.log, [s.active.id]: { status: 'expired', xp: 0, at: now } } }
}

// One tap on the tracker. Hitting the target before time runs out completes the mission.
export function track(s: GameState, now: number): GameState {
  s = expireIfDue(s, now)
  if (!s.active) return s
  const m = missionById(s.active.id)
  const count = s.active.count + 1
  if (count < m.tracker!.target) return { ...s, active: { ...s.active, count } }
  const { state, gained } = earn(s, m.stat, m.xp)
  return { ...state, active: null, log: { ...state.log, [m.id]: { status: 'done', xp: gained, at: now } } }
}

// Left the app mid-mission: lose BREAK_PENALTY XP from the mission's stat, attempt is over.
export function breakActive(s: GameState, now: number): GameState {
  if (!s.active) return s
  const m = missionById(s.active.id)
  const { state, lost } = penalize(s, m.stat, BREAK_PENALTY)
  return { ...state, active: null, log: { ...state.log, [m.id]: { status: 'broken', xp: 0 - lost, at: now } } }
}

export function completeTap(s: GameState, id: string, now: number): GameState {
  const m = missionById(id)
  if (m.kind !== 'tap' || isDone(s, id)) return s
  const { state, gained } = earn(s, m.stat, m.xp)
  return { ...state, log: { ...state.log, [id]: { status: 'done', xp: gained, at: now } } }
}

// baseXp comes from sleepXp / moodXp / moneyXp. Once per day.
export function checkIn(s: GameState, id: string, baseXp: number, note: string, now: number): GameState {
  const m = missionById(id)
  if (m.kind !== 'checkin' || isDone(s, id)) return s
  const { state, gained } = earn(s, m.stat, baseXp)
  return { ...state, log: { ...state.log, [id]: { status: 'done', xp: gained, at: now, note } } }
}

export const logWorkout = (s: GameState, date: string, w: Workout): GameState => ({
  ...s,
  workouts: { ...s.workouts, [date]: w },
})

// Save the session and tick the Gym mission (+XP) together.
export const finishWorkout = (s: GameState, date: string, w: Workout, now: number): GameState =>
  completeTap(logWorkout(s, date, w), 'gym', now)
