import type { GameState } from './missions'
import { rankFor, totalXp } from './ranks'
import { isDayComplete } from './streak'

// What changed between two states, for the toast and the floating "+XP". Pure so it is testable.
// Level-ups are not here: the full-screen LevelUp card already announces them.
export function feedbackFor(prev: GameState, next: GameState): { xp: number; lines: string[] } {
  if (prev.day !== next.day) return { xp: 0, lines: [] } // day rollover is not a reward
  const [pt, nt] = [totalXp(prev.statXp), totalXp(next.statXp)]
  const lines: string[] = []
  if (nt > pt && rankFor(nt) !== rankFor(pt)) lines.push(`[System] Rank ${rankFor(nt)} reached`)
  if (!isDayComplete(prev.log) && isDayComplete(next.log)) lines.push('[System] All daily quests complete. Good place to stop.')
  return { xp: nt - pt, lines }
}
