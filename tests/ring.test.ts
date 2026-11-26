import { describe, expect, it } from 'vitest'
import { ringDash } from '../src/core/ring'

describe('ringDash', () => {
  it('fills the arc in proportion to pct', () => {
    expect(ringDash(0)).toBe('0.0 213.6')
    expect(ringDash(0.5)).toBe('106.8 213.6')
    expect(ringDash(1)).toBe('213.6 213.6')
  })
  it('clamps out-of-range values', () => {
    expect(ringDash(-1)).toBe('0.0 213.6')
    expect(ringDash(2)).toBe('213.6 213.6')
  })
})
