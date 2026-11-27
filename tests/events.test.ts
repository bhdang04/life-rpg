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
    expect(feedbackFor(base(), withXp('body', 50))).toEqual({ xp: 50, lines: [] })
    expect(feedbackFor(withXp('body', 50), withXp('body', 45)).xp).toBe(-5)
  })
  it('leaves level-ups to the LevelUp card', () => {
    expect(feedbackFor(withXp('body', 90), withXp('body', 110)).lines).toEqual([])
  })
  it('announces a rank up but not a rank drop', () => {
    expect(feedbackFor(withXp('body', 990), withXp('body', 1010)).lines).toContain('[System] Rank D reached')
    expect(feedbackFor(withXp('body', 1010), withXp('body', 990)).lines).not.toContain('[System] Rank E reached')
  })
  it('announces day complete once', () => {
    const done = base()
    for (const id of REQUIRED_IDS) done.log[id] = { status: 'done', xp: 0, at: 0 }
    expect(feedbackFor(base(), done).lines).toEqual(['[System] All daily quests complete. Good place to stop.'])
    expect(feedbackFor(done, done).lines).toEqual([])
  })
  it('stays silent across a day rollover', () => {
    const next = { ...withXp('body', 500), day: '2026-11-26' }
    expect(feedbackFor(base(), next)).toEqual({ xp: 0, lines: [] })
  })
})
