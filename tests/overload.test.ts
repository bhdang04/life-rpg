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
