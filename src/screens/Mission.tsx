import { useEffect, useState } from 'react'
import { BREAK_PENALTY, missionById } from '../config/missions'
import { breakActive, expireIfDue, track, type ActiveMission, type GameState } from '../core/missions'
import { Ring } from '../ui/Ring'

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
    let gone = false // left the screen before the request resolved: release the late lock
    navigator.wakeLock?.request('screen').then((l) => { if (gone) void l.release(); else lock = l }).catch(() => {})
    return () => { gone = true; void lock?.release().catch(() => {}) }
  }, [])

  const left = active.endsAt - now
  return (
    <main className="lock">
      <small>FOCUS</small>
      <h1 className="display">{m.name}</h1>
      <div className="lock-ring">
        <Ring level="" pct={Math.min(1, Math.max(0, left / (active.endsAt - active.startedAt)))} color="#c4b5fd" label={`${clock(left)} left`} size={300} />
        <p className={left <= 10_000 ? 'clock display urgent' : 'clock display'} aria-live="off">{clock(left)}</p>
      </div>
      <p>{active.count} / {m.tracker!.target} {m.tracker!.label} · +{m.xp} XP at stake</p>
      <button className="go" onClick={() => onChange((s) => track(s, Date.now()))}>+1 {m.tracker!.label}</button>
      <p className="hint">Leave the app and you lose {BREAK_PENALTY} XP. Lock the phone in: Settings → Accessibility → Guided Access, triple-click the side button.</p>
      <button className="quiet" onClick={() => onChange((s) => breakActive(s, Date.now()))}>Give up (-{BREAK_PENALTY} XP)</button>
    </main>
  )
}
