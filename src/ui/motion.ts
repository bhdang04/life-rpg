export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Short vibration. Android only: iOS Safari has no navigator.vibrate, so it is silent there.
// shortcut: no on/off setting (it would add a saved field), add one in Settings if the buzz annoys
export function buzz(pattern: number | number[]) {
  try {
    if (!reducedMotion()) navigator.vibrate?.(pattern)
  } catch {
    // vibrate can throw before the first tap, nothing to do
  }
}
