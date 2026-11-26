import type { Workout } from './missions'

export const TOP_REPS = 8
export const BASE_REPS = 6

const DUMBBELL = ['Incline DB Rows', 'DB Shoulder Press']
const BODYWEIGHT = ['Dips']

// lb added when the top is hit: 5 machine, 2.5 dumbbell, 0 bodyweight (reps only)
export const stepFor = (ex: string) => (BODYWEIGHT.includes(ex) ? 0 : DUMBBELL.includes(ex) ? 2.5 : 5)

// r = reps in the weakest set (both sets must reach TOP_REPS to earn more weight).
export function nextTarget(last: { w: number; r: number }, step: number): { w: number; r: number } {
  if (last.r >= TOP_REPS && step > 0) return { w: last.w + step, r: BASE_REPS }
  return { w: last.w, r: last.r + 1 }
}

// Most recent session with this exercise: its top weight, and the fewest reps at that weight.
// shortcut: a lighter back-off set is ignored, add per-set tracking if that matters
export function lastSession(workouts: Record<string, Workout>, ex: string): { w: number; r: number; reps: number[]; date: string } | null {
  for (const date of Object.keys(workouts).sort().reverse()) {
    const sets = workouts[date].entries.filter((e) => e.ex === ex)
    if (!sets.length) continue
    const w = Math.max(...sets.map((e) => e.w))
    const reps = sets.filter((e) => e.w === w).map((e) => e.r)
    return { w, r: Math.min(...reps), reps, date }
  }
  return null
}

// What you did last and what to aim for; both null for an exercise with no history.
export function rowFor(workouts: Record<string, Workout>, ex: string) {
  const last = lastSession(workouts, ex)
  return { ex, last, target: last ? nextTarget(last, stepFor(ex)) : null }
}

// Exercises from your latest session of this split, each with what you did and what to aim for.
export function plan(workouts: Record<string, Workout>, split: string) {
  const date = Object.keys(workouts).sort().reverse().find((d) => workouts[d].split === split)
  if (!date) return []
  return [...new Set(workouts[date].entries.map((e) => e.ex))].map((ex) => rowFor(workouts, ex))
}
