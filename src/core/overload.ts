export const TOP_REPS = 8
export const BASE_REPS = 6

// r = reps in the weakest set (both sets must reach TOP_REPS to earn more weight).
// step: 5 for machines, 2.5 for dumbbells.
export function nextTarget(last: { w: number; r: number }, step: number): { w: number; r: number } {
  if (last.r >= TOP_REPS) return { w: last.w + step, r: BASE_REPS }
  return { w: last.w, r: last.r + 1 }
}
