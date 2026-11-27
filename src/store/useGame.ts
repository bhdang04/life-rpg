import { useEffect, useState } from 'react'
import type { GameState } from '../core/missions'
import { dayKey, rollover } from '../core/streak'
import { load, save } from './storage'

export function useGame() {
  const [state, setState] = useState<GameState>(() => load())
  const [saveFailed, setSaveFailed] = useState(false)
  useEffect(() => {
    try { save(state); setSaveFailed(false) } catch { setSaveFailed(true) } // storage blocked or full
  }, [state])
  // A tab left open past midnight rolls the day when it comes back to the front.
  useEffect(() => {
    const onShow = () => !document.hidden && setState((s) => rollover(s, dayKey(new Date())))
    document.addEventListener('visibilitychange', onShow)
    return () => document.removeEventListener('visibilitychange', onShow)
  }, [])
  return [state, setState, saveFailed] as const
}
