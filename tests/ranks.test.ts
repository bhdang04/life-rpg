import { describe, expect, it } from 'vitest'
import { levelFor, levelProgress, nextRank, rankFor, totalXp } from '../src/core/ranks'

describe('levels', () => {
  it('100 XP per level, starting at 1', () => {
    expect(levelFor(0)).toBe(1)
    expect(levelFor(99)).toBe(1)
    expect(levelFor(100)).toBe(2)
    expect(levelFor(1050)).toBe(11)
    expect(levelProgress(250)).toEqual({ level: 3, into: 50, need: 100 })
  })
})

describe('overall rank', () => {
  it('E to S by total XP', () => {
    expect(rankFor(0)).toBe('E')
    expect(rankFor(999)).toBe('E')
    expect(rankFor(1000)).toBe('D')
    expect(rankFor(3000)).toBe('C')
    expect(rankFor(7000)).toBe('B')
    expect(rankFor(15000)).toBe('A')
    expect(rankFor(30000)).toBe('S')
    expect(rankFor(999999)).toBe('S')
  })
  it('next rank and total', () => {
    expect(nextRank(500)).toEqual({ rank: 'D', minXp: 1000 })
    expect(nextRank(30000)).toBeNull()
    expect(totalXp({ body: 1, craft: 2, mind: 3, discipline: 4, money: 5 })).toBe(15)
  })
})
