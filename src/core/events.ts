import type { GameState } from './missions'
import { totalXp } from './ranks'
import { isDayComplete } from './streak'

// What changed between two states, for the floating "+XP" and the day-complete moment. Pure so it is testable.
// Level-ups and rank-ups are not here: the LevelUp and RankUp cards own them.
export function feedbackFor(prev: GameState, next: GameState): { xp: number; dayComplete: boolean } {
  if (prev.day !== next.day) return { xp: 0, dayComplete: false } // day rollover is not a reward
  const [pt, nt] = [totalXp(prev.statXp), totalXp(next.statXp)]
  return { xp: nt - pt, dayComplete: !isDayComplete(prev.log) && isDayComplete(next.log) }
}
