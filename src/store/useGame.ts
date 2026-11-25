import { useEffect, useState } from 'react'
import type { GameState } from '../core/missions'
import { load, save } from './storage'

// shortcut: day rollover only runs when the app is opened, a tab left open past midnight keeps yesterday until reload, fix with a visibilitychange rollover in step 4
export function useGame() {
  const [state, setState] = useState<GameState>(() => load())
  useEffect(() => save(state), [state])
  return [state, setState] as const
}
