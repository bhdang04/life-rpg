import { XP_PER_GOLD } from '../config/missions'

// 1 gold per 10 XP earned; leftover XP carries to the next award. Penalties never remove gold.
export function addGold(gold: number, carry: number, xpEarned: number): { gold: number; carry: number } {
  const pool = carry + Math.max(0, xpEarned)
  return { gold: gold + Math.floor(pool / XP_PER_GOLD), carry: pool % XP_PER_GOLD }
}
