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

// A session's top weight and the fewest reps at it, per exercise (same rule as lastSession).
const tops = (w: Workout) => {
  const out: Record<string, { w: number; r: number }> = {}
  for (const ex of new Set(w.entries.map((e) => e.ex))) {
    const sets = w.entries.filter((e) => e.ex === ex)
    const top = Math.max(...sets.map((e) => e.w))
    out[ex] = { w: top, r: Math.min(...sets.filter((e) => e.w === top).map((e) => e.r)) }
  }
  return out
}

// Exercises where `done` beats every earlier session: more weight, or the same weight with more reps.
// A first-ever session is not a PR. `date` is skipped so redoing today's workout compares against the past.
// shortcut: compares only each session's top weight, a heavier-reps trade-off at a lighter weight is not seen
export function newBests(workouts: Record<string, Workout>, date: string, done: Workout): { ex: string; w: number; r: number }[] {
  const past = Object.entries(workouts).filter(([d]) => d !== date).map(([, w]) => tops(w))
  return Object.entries(tops(done)).flatMap(([ex, t]) => {
    const prior = past.flatMap((p) => (p[ex] ? [p[ex]] : []))
    const beat = prior.length > 0 && prior.every((p) => t.w > p.w || (t.w === p.w && t.r > p.r))
    return beat ? [{ ex, ...t }] : []
  })
}
