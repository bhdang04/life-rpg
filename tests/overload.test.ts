import { describe, expect, it } from 'vitest'
import { nextTarget } from '../src/core/overload'

describe('nextTarget', () => {
  it('adds weight and resets reps when the top is hit (machine)', () => {
    expect(nextTarget({ w: 225, r: 8 }, 5)).toEqual({ w: 230, r: 6 })
  })
  it('adds 2.5 for dumbbells', () => {
    expect(nextTarget({ w: 87.5, r: 8 }, 2.5)).toEqual({ w: 90, r: 6 })
  })
  it('keeps weight and adds a rep when short of the top', () => {
    expect(nextTarget({ w: 225, r: 6 }, 5)).toEqual({ w: 225, r: 7 })
  })
  it('never targets more than the top reps', () => {
    expect(nextTarget({ w: 225, r: 7 }, 5).r).toBeLessThanOrEqual(8)
  })
})

import { lastSession, plan, rowFor, stepFor } from '../src/core/overload'

describe('stepFor', () => {
  it('picks the step by equipment', () => {
    expect(stepFor('Pec Fly')).toBe(5)
    expect(stepFor('Incline DB Rows')).toBe(2.5)
    expect(stepFor('Dips')).toBe(0)
  })
  it('bodyweight never resets reps', () => {
    expect(nextTarget({ w: 0, r: 12 }, 0)).toEqual({ w: 0, r: 13 })
  })
})

describe('lastSession', () => {
  const ws = {
    '2026-11-01': { split: 'Pull', entries: [{ ex: 'Bicep Curl', w: 60, r: 8, s: 1 }] },
    '2026-11-05': {
      split: 'Pull',
      entries: [
        { ex: 'Bicep Curl', w: 65, r: 7, s: 1 },
        { ex: 'Lat Rows', w: 80, r: 8, s: 1 },
        { ex: 'Bicep Curl', w: 65, r: 5, s: 1 },
        { ex: 'Bicep Curl', w: 60, r: 9, s: 1 },
      ],
    },
  }
  it('uses the newest session, top weight, fewest reps at it', () => {
    expect(lastSession(ws, 'Bicep Curl')).toEqual({ w: 65, r: 5, reps: [7, 5], date: '2026-11-05' })
  })
  it('falls back to an older session and returns null when never done', () => {
    expect(lastSession(ws, 'Lat Rows')?.date).toBe('2026-11-05')
    expect(lastSession(ws, 'Squat')).toBeNull()
  })
})

describe('plan', () => {
  const ws = {
    '2026-11-03': { split: 'Pull', entries: [{ ex: 'Lat Rows', w: 80, r: 8, s: 1 }, { ex: 'Lat Rows', w: 80, r: 8, s: 1 }] },
    '2026-11-04': { split: 'Push', entries: [{ ex: 'Pec Fly', w: 190, r: 6, s: 1 }] },
  }
  it('lists the split\'s last exercises with a target', () => {
    expect(plan(ws, 'Pull')).toEqual([
      { ex: 'Lat Rows', last: { w: 80, r: 8, reps: [8, 8], date: '2026-11-03' }, target: { w: 85, r: 6 } },
    ])
    expect(plan(ws, 'Push')[0].target).toEqual({ w: 190, r: 7 })
  })
  it('is empty for a split never done', () => {
    expect(plan(ws, 'Legs')).toEqual([])
  })
})

describe('rowFor', () => {
  it('has no last or target for an exercise with no history', () => {
    expect(rowFor({}, 'Cable Crunch')).toEqual({ ex: 'Cable Crunch', last: null, target: null })
  })
})

import { newBests } from '../src/core/overload'

describe('newBests', () => {
  const day = (ex: string, w: number, ...r: number[]) => ({ split: 'Push', entries: r.map((n) => ({ ex, w, r: n, s: 1 })) })
  const past = { '2026-11-01': day('Bench', 100, 8, 8), '2026-11-08': day('Bench', 105, 6, 7) }
  it('flags more weight', () => expect(newBests(past, '2026-11-15', day('Bench', 110, 5, 5))).toEqual([{ ex: 'Bench', w: 110, r: 5 }]))
  it('flags more reps at the same top weight', () => expect(newBests(past, '2026-11-15', day('Bench', 105, 7, 8))).toEqual([{ ex: 'Bench', w: 105, r: 7 }]))
  it('ignores a tie, a lighter day and a first-ever exercise', () => {
    expect(newBests(past, '2026-11-15', day('Bench', 105, 6, 6))).toEqual([])
    expect(newBests(past, '2026-11-15', day('Bench', 100, 12, 12))).toEqual([])
    expect(newBests(past, '2026-11-15', day('Squat', 200, 5, 5))).toEqual([])
  })
  it('skips the same date when redoing a workout', () => expect(newBests(past, '2026-11-08', day('Bench', 100, 8, 8))).toEqual([]))
})
