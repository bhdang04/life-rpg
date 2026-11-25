import { describe, expect, it } from 'vitest'
import { addGold } from '../src/core/gold'

describe('gold', () => {
  it('1 gold per 10 XP with carry', () => {
    expect(addGold(0, 0, 55)).toEqual({ gold: 5, carry: 5 })
    expect(addGold(5, 5, 5)).toEqual({ gold: 6, carry: 0 })
    expect(addGold(0, 0, 9)).toEqual({ gold: 0, carry: 9 })
  })
  it('negative XP never removes gold', () => {
    expect(addGold(10, 3, -5)).toEqual({ gold: 10, carry: 3 })
  })
})
