import { useEffect, useState } from 'react'
import { missionById } from '../config/missions'
import { breakActive, expireIfDue, track, type ActiveMission, type GameState } from '../core/missions'

interface Props {
  active: ActiveMission
  onChange: (fn: (s: GameState) => GameState) => void
}

const clock = (ms: number) => {
  const t = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}

export function Mission({ active, onChange }: Props) {
  const m = missionById(active.id)
  const [now, setNow] = useState(Date.now())

  // Tick once a second; expireIfDue ends the mission (0 XP) when the countdown hits zero.
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now())
      onChange((s) => expireIfDue(s, Date.now()))
    }, 1000)
    return () => clearInterval(id)
  }, [onChange])

  // Leaving the app = broken. shortcut: visibilitychange can't tell a notification peek from a real exit, add a grace period if it breaks too easily
  useEffect(() => {
    const onHide = () => document.hidden && onChange((s) => breakActive(s, Date.now()))
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [onChange])

  // Keep the screen awake. shortcut: no re-request after the OS drops the lock, a dropped lock only lets the screen dim
  useEffect(() => {
    let lock: WakeLockSentinel | undefined
    navigator.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {})
    return () => void lock?.release().catch(() => {})
  }, [])

  return (
    <main>
      <h1>{m.name}</h1>
      <p className="clock" aria-live="off">{clock(active.endsAt - now)}</p>
      <p>
        {active.count} / {m.tracker!.target} {m.tracker!.label}
      </p>
      <button onClick={() => onChange((s) => track(s, Date.now()))}>+1 {m.tracker!.label}</button>
      <p>[System] Complete the objective before time expires, or the reward is forfeited. Leaving the app counts as desertion (-5 XP).</p>
      <p>Lock yourself in: Settings → Accessibility → Guided Access, then triple-click the side button.</p>
      <button onClick={() => onChange((s) => breakActive(s, Date.now()))}>Give up (-5 XP)</button>
    </main>
  )
}
