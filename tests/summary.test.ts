import { describe, expect, it } from 'vitest'
import { newState, type LogEntry } from '../src/core/missions'
import { REQUIRED_IDS } from '../src/core/streak'
import { logXp, recentDays, xpByStat } from '../src/core/summary'

const done = (xp: number): LogEntry => ({ status: 'done', xp, at: 0 })

describe('summary', () => {
  it('sums XP and groups it by stat, penalties included', () => {
    const log = { gym: done(50), filming: done(50), work: done(60), reading: { status: 'broken' as const, xp: -5, at: 0 }, ghost: done(99) }
    expect(logXp(log)).toBe(254)
    expect(xpByStat(log)).toEqual({ body: 50, craft: 110, mind: -5 }) // "ghost" is not in the config
  })
  it('lists the last n days oldest first, ending today', () => {
    const s = newState('2026-03-02') // crosses a month boundary
    const days = recentDays(s, 4)
    expect(days.map((d) => d.day)).toEqual(['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02'])
    expect(days.every((d) => d.status === 'none' && d.xp === 0)).toBe(true)
  })
  it('marks complete, partial and none from history and today', () => {
    const s = newState('2026-11-25')
    s.history['2026-11-24'] = Object.fromEntries(REQUIRED_IDS.map((id) => [id, done(10)]))
    s.history['2026-11-23'] = { sleep: done(30) }
    s.log = { gym: done(50) }
    const [d22, d23, d24, d25] = recentDays(s, 4)
    expect([d22.status, d23.status, d24.status, d25.status]).toEqual(['none', 'partial', 'complete', 'partial'])
    expect([d23.xp, d24.xp, d25.xp]).toEqual([30, 40, 50])
  })
})
