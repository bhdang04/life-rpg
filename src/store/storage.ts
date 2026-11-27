import { breakActive, newState, type GameState } from '../core/missions'
import { dayKey, rollover } from '../core/streak'
// shortcut: the seed is your real workout history and ships in the bundle, deploy to a private host only, drop the seed before any public deploy
import seed from '../config/workoutSeed.json'

export const KEY = 'life-rpg:v1'

// shortcut: only checks version + a few top-level keys, add real schema validation when version 2 exists
const looksValid = (x: any): x is GameState =>
  x?.version === 1 && x.log && x.statXp && x.settings && typeof x.day === 'string'

// Reopening mid-mission counts as leaving the app: break it, then roll the day.
export function load(store: Pick<Storage, 'getItem' | 'setItem'> = localStorage, now = Date.now()): GameState {
  let raw: string | null = null
  try { raw = store.getItem(KEY) } catch {} // storage blocked: start fresh, save() will report it
  const today = dayKey(new Date(now))
  if (!raw) return { ...newState(today), workouts: seed }
  try {
    const s = JSON.parse(raw)
    if (looksValid(s)) return rollover(breakActive({ ...s, workouts: Object.keys(s.workouts ?? {}).length ? s.workouts : seed }, now), today)
  } catch {}
  try { store.setItem(KEY + ':corrupt', raw) } catch {} // keep the bad save so it can be recovered by hand
  return { ...newState(today), workouts: seed }
}

export const save = (s: GameState, store: Pick<Storage, 'setItem'> = localStorage) =>
  store.setItem(KEY, JSON.stringify(s))

export const exportJSON = (s: GameState) => JSON.stringify(s, null, 2)
