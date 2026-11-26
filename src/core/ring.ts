// Stroke dash for a progress ring of radius 34 (the arc starts at 12 o'clock, set by the SVG rotate).
const CIRCUMFERENCE = 2 * Math.PI * 34

// pct is 0..1; out-of-range values are clamped.
export function ringDash(pct: number): string {
  const p = Math.min(1, Math.max(0, pct))
  return `${(CIRCUMFERENCE * p).toFixed(1)} ${CIRCUMFERENCE.toFixed(1)}`
}
