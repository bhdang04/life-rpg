import {
  SLEEP_FULL_MIN,
  STREAK_BONUS_CAP,
  STREAK_BONUS_PER_DAY,
  missionById,
  type Stat,
} from '../config/missions'
import { addGold } from './gold'
import type { GameState } from './missions'

export function streakMultiplier(streak: number): number {
  return 1 + Math.min(Math.max(0, streak) * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP)
}

export function withStreak(baseXp: number, streak: number): number {
  return Math.round(baseXp * streakMultiplier(streak))
}

// 7-9h = full XP. Under 7h scales linearly. Over 9h still full (no oversleep penalty).
export function sleepXp(hours: number): number {
  const max = missionById('sleep').xp
  if (!(hours > 0)) return 0
  if (hours >= SLEEP_FULL_MIN) return max
  return Math.round((max * hours) / SLEEP_FULL_MIN)
}

export function moneyXp(spent: number, budget: number): number {
  return spent <= budget ? missionById('money').xp : 0
}

export function moodXp(): number {
  return missionById('mood').xp
}

// Adds streak-boosted XP to a stat and converts it to gold. Returns the XP actually gained.
export function earn(state: GameState, stat: Stat, baseXp: number): { state: GameState; gained: number } {
  const gained = withStreak(baseXp, state.streak)
  const { gold, carry } = addGold(state.gold, state.goldCarry, gained)
  return {
    state: { ...state, statXp: { ...state.statXp, [stat]: state.statXp[stat] + gained }, gold, goldCarry: carry },
    gained,
  }
}

// Removes XP from a stat, never below 0. Returns the XP actually lost.
export function penalize(state: GameState, stat: Stat, amount: number): { state: GameState; lost: number } {
  const lost = Math.min(amount, state.statXp[stat])
  return { state: { ...state, statXp: { ...state.statXp, [stat]: state.statXp[stat] - lost } }, lost }
}
