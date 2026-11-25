import { describe, expect, it } from 'vitest'
import { dayKey, isDayComplete, rollover } from '../src/core/streak'
import { newState, type GameState } from '../src/core/missions'

const done = { status: 'done' as const, xp: 1, at: 0 }
const allRequired = { gym: done, work: done, reading: done, filming: done }

describe('required-day rule', () => {
  it('needs Gym, Work Block, Reading, Filming', () => {
    expect(isDayComplete(allRequired)).toBe(true)
  })
  it('LeetCode is bonus, not required', () => {
    expect(isDayComplete({ ...allRequired, leetcode: undefined as never })).toBe(true)
    expect(isDayComplete({ leetcode: done, gym: done, work: done, reading: done })).toBe(false)
  })
  it('broken or expired does not count', () => {
    expect(isDayComplete({ ...allRequired, reading: { ...done, status: 'broken' } })).toBe(false)
    expect(isDayComplete({ ...allRequired, work: { ...done, status: 'expired' } })).toBe(false)
  })
})

describe('rollover', () => {
  const base = (log: GameState['log'], streak = 3): GameState => ({ ...newState('2026-11-24'), log, streak })

  it('same day is a no-op', () => {
    const s = base(allRequired)
    expect(rollover(s, '2026-11-24')).toBe(s)
  })
  it('complete day continues streak and archives log', () => {
    const r = rollover(base(allRequired), '2026-11-25')
    expect(r.streak).toBe(4)
    expect(r.day).toBe('2026-11-25')
    expect(r.log).toEqual({})
    expect(r.history['2026-11-24']).toEqual(allRequired)
  })
  it('incomplete day breaks streak', () => {
    expect(rollover(base({ gym: done }), '2026-11-25').streak).toBe(0)
  })
  it('skipped days break streak even if last day was complete', () => {
    expect(rollover(base(allRequired), '2026-11-27').streak).toBe(0)
  })
  it('clock going backwards changes nothing', () => {
    expect(rollover(base(allRequired), '2026-11-20').day).toBe('2026-11-24')
  })
  it('dayKey is local YYYY-MM-DD', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
