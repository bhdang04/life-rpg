import { describe, expect, it } from 'vitest'
import { earn, moneyXp, penalize, sleepXp, streakMultiplier, withStreak } from '../src/core/xp'
import { newState } from '../src/core/missions'

describe('sleep scaling', () => {
  it('7-9h gives full 30', () => {
    expect(sleepXp(7)).toBe(30)
    expect(sleepXp(8)).toBe(30)
    expect(sleepXp(9)).toBe(30)
  })
  it('scales below 7h', () => {
    expect(sleepXp(3.5)).toBe(15)
    expect(sleepXp(6)).toBe(26) // 30*6/7 = 25.7
  })
  it('over 9h is still full, 0 or bad input gives 0', () => {
    expect(sleepXp(11)).toBe(30)
    expect(sleepXp(0)).toBe(0)
    expect(sleepXp(NaN)).toBe(0)
    expect(sleepXp(-2)).toBe(0)
  })
})

describe('money', () => {
  it('under or at budget = 20, over = 0', () => {
    expect(moneyXp(12, 20)).toBe(20)
    expect(moneyXp(20, 20)).toBe(20)
    expect(moneyXp(20.01, 20)).toBe(0)
  })
})

describe('streak bonus', () => {
  it('+10% per day capped at +50%', () => {
    expect(streakMultiplier(0)).toBe(1)
    expect(streakMultiplier(3)).toBeCloseTo(1.3)
    expect(streakMultiplier(5)).toBeCloseTo(1.5)
    expect(streakMultiplier(40)).toBeCloseTo(1.5)
    expect(withStreak(50, 2)).toBe(60)
    expect(withStreak(30, 10)).toBe(45)
  })
})

describe('earn / penalize', () => {
  it('earn applies streak and adds gold', () => {
    const s = { ...newState('2026-11-25'), streak: 2 }
    const { state, gained } = earn(s, 'body', 50)
    expect(gained).toBe(60)
    expect(state.statXp.body).toBe(60)
    expect(state.gold).toBe(6)
  })
  it('penalize never goes below 0', () => {
    const s = newState('2026-11-25')
    s.statXp.mind = 3
    const { state, lost } = penalize(s, 'mind', 5)
    expect(lost).toBe(3)
    expect(state.statXp.mind).toBe(0)
  })
})
