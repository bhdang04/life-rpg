import type { GameState } from './missions'
import { totalXp } from './ranks'
import { isDayComplete } from './streak'

// What changed between two states, for the toast and the floating "+XP". Pure so it is testable.
// Level-ups, rank-ups and day complete are not lines: the LevelUp, RankUp and DayComplete screens own them.
export function feedbackFor(prev: GameState, next: GameState): { xp: number; lines: string[]; dayComplete: boolean } {
  if (prev.day !== next.day) return { xp: 0, lines: [], dayComplete: false } // day rollover is not a reward
  const [pt, nt] = [totalXp(prev.statXp), totalXp(next.statXp)]
  const lines: string[] = [] // shortcut: no toast lines left since RankUp took over, drop `lines` and the toast if none return
  return { xp: nt - pt, lines, dayComplete: !isDayComplete(prev.log) && isDayComplete(next.log) }
}
