import { describe, expect, it } from 'vitest'
import { REQUIRED_IDS } from '../src/core/streak'
import { crossing, feedbackFor } from '../src/core/events'
import { levelFor, rankFor } from '../src/core/ranks'
import { newState } from '../src/core/missions'

const base = () => newState('2026-11-25')
const withXp = (stat: 'body' | 'craft', xp: number) => {
  const s = base()
  s.statXp[stat] = xp
  return s
}

describe('feedbackFor', () => {
  it('reports XP gained and lost', () => {
    expect(feedbackFor(base(), withXp('body', 50))).toEqual({ xp: 50, dayComplete: false })
    expect(feedbackFor(withXp('body', 50), withXp('body', 45)).xp).toBe(-5)
  })
  it('flags day complete once', () => {
    const done = base()
    for (const id of REQUIRED_IDS) done.log[id] = { status: 'done', xp: 0, at: 0 }
    expect(feedbackFor(base(), done).dayComplete).toBe(true)
    expect(feedbackFor(done, done).dayComplete).toBe(false)
  })
  it('stays silent across a day rollover', () => {
    const next = { ...withXp('body', 500), day: '2026-11-26' }
    expect(feedbackFor(base(), next)).toEqual({ xp: 0, dayComplete: false })
  })
})

describe('crossing', () => {
  it('fires on a new rank or level', () => {
    expect(crossing(990, 1010, rankFor)).toBe(true)
    expect(crossing(95, 105, levelFor)).toBe(true)
  })
  it('does not fire inside a rank or on a drop', () => {
    expect(crossing(1010, 1500, rankFor)).toBe(false)
    expect(crossing(1010, 990, rankFor)).toBe(false)
  })
  it('does not fire again when re-earning after a penalty (best stays 1003)', () => {
    expect(crossing(1003, 1008, rankFor)).toBe(false)
  })
})
