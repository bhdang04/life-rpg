import { describe, expect, it } from 'vitest'
import { breakActive, checkIn, completeTap, expireIfDue, newState, startMission, track } from '../src/core/missions'

const T0 = 1_000_000
const MIN = 60_000

describe('timed missions', () => {
  it('start uses the editable timer', () => {
    const s = newState('2026-11-25')
    s.settings.minutes.reading = 10
    expect(startMission(s, 'reading', T0).active).toEqual({ id: 'reading', startedAt: T0, endsAt: T0 + 10 * MIN, count: 0 })
  })
  it('hitting tracker target in time awards XP', () => {
    let s = startMission(newState('2026-11-25'), 'leetcode', T0)
    s = track(s, T0 + MIN)
    expect(s.active?.count).toBe(1)
    s = track(s, T0 + 2 * MIN)
    expect(s.active).toBeNull()
    expect(s.log.leetcode).toMatchObject({ status: 'done', xp: 50 })
    expect(s.statXp.craft).toBe(50)
    expect(s.gold).toBe(5)
  })
  it('timer expiring unfinished = 0 XP', () => {
    let s = startMission(newState('2026-11-25'), 'leetcode', T0)
    s = track(s, T0 + MIN)
    s = track(s, T0 + 45 * MIN) // too late: expires before counting
    expect(s.log.leetcode).toMatchObject({ status: 'expired', xp: 0 })
    expect(s.statXp.craft).toBe(0)
    expect(expireIfDue(startMission(s, 'reading', T0), T0 + 29 * MIN).active).not.toBeNull()
  })
  it('cannot start a second mission or redo a done one', () => {
    let s = startMission(newState('2026-11-25'), 'work', T0)
    expect(startMission(s, 'reading', T0)).toBe(s)
    s = track(s, T0 + MIN)
    expect(startMission(s, 'work', T0 + 2 * MIN)).toBe(s)
  })
})

describe('broken-mission penalty', () => {
  it('leaving costs 5 XP from the mission stat and flags broken', () => {
    let s = newState('2026-11-25')
    s.statXp.mind = 40
    s = breakActive(startMission(s, 'reading', T0), T0 + MIN)
    expect(s.statXp.mind).toBe(35)
    expect(s.active).toBeNull()
    expect(s.log.reading).toMatchObject({ status: 'broken', xp: -5 })
  })
  it('penalty does not go below 0, gold untouched, retry allowed', () => {
    let s = { ...newState('2026-11-25'), gold: 7 }
    s = breakActive(startMission(s, 'reading', T0), T0 + MIN)
    expect(s.statXp.mind).toBe(0)
    expect(s.log.reading.xp).toBe(0)
    expect(s.gold).toBe(7)
    expect(startMission(s, 'reading', T0 + 2 * MIN).active?.id).toBe('reading')
  })
  it('no active mission = no-op', () => {
    const s = newState('2026-11-25')
    expect(breakActive(s, T0)).toBe(s)
  })
})

describe('one-tap and check-ins', () => {
  it('gym once per day with streak bonus', () => {
    let s = { ...newState('2026-11-25'), streak: 1 }
    s = completeTap(s, 'gym', T0)
    expect(s.statXp.body).toBe(55)
    expect(completeTap(s, 'gym', T0)).toBe(s)
  })
  it('check-in stores note and XP once', () => {
    let s = checkIn(newState('2026-11-25'), 'sleep', 26, '6h', T0)
    expect(s.log.sleep).toMatchObject({ status: 'done', xp: 26, note: '6h' })
    expect(checkIn(s, 'sleep', 30, '8h', T0)).toBe(s)
  })
})
