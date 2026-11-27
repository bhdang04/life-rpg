import type { GameState } from './missions'
import { rankFor, totalXp } from './ranks'
import { isDayComplete } from './streak'

// What changed between two states, for the toast and the floating "+XP". Pure so it is testable.
// Level-ups and day complete are not lines: the LevelUp card and the DayComplete screen own them.
export function feedbackFor(prev: GameState, next: GameState): { xp: number; lines: string[]; dayComplete: boolean } {
  if (prev.day !== next.day) return { xp: 0, lines: [], dayComplete: false } // day rollover is not a reward
  const [pt, nt] = [totalXp(prev.statXp), totalXp(next.statXp)]
  const lines: string[] = []
  if (nt > pt && rankFor(nt) !== rankFor(pt)) lines.push(`[System] Rank ${rankFor(nt)} reached`)
  return { xp: nt - pt, lines, dayComplete: !isDayComplete(prev.log) && isDayComplete(next.log) }
}
