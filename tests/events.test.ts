import { describe, expect, it } from 'vitest'
import { REQUIRED_IDS } from '../src/core/streak'
import { feedbackFor } from '../src/core/events'
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
