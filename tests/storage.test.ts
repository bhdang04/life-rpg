import { describe, expect, it } from 'vitest'
import { newState, startMission, completeTap } from '../src/core/missions'
import { KEY, exportJSON, load, save } from '../src/store/storage'

const fake = () => {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m }
}
const NOW = new Date(2026, 10, 25, 12).getTime()

describe('storage', () => {
  it('empty store gives a fresh state for today', () => {
    expect(load(fake(), NOW).day).toBe('2026-11-25')
  })
  it('save then load round-trips', () => {
    const st = fake()
    const s = completeTap(newState('2026-11-25'), 'gym', NOW)
    save(s, st)
    expect(load(st, NOW)).toEqual(s)
    expect(JSON.parse(exportJSON(s))).toEqual(s)
  })
  it('old save without workouts loads with an empty log', () => {
    const st = fake()
    const { workouts: _w, ...old } = newState('2026-11-25')
    st.setItem(KEY, JSON.stringify(old))
    expect(load(st, NOW).workouts).toEqual({})
  })
  it('reopen with active mission breaks it', () => {
    const st = fake()
    save(startMission(newState('2026-11-25'), 'leetcode', NOW), st)
    const s = load(st, NOW + 1000)
    expect(s.active).toBeNull()
    expect(s.log.leetcode.status).toBe('broken')
  })
  it('new day rolls over', () => {
    const st = fake()
    save(completeTap(newState('2026-11-24'), 'gym', NOW), st)
    const s = load(st, NOW)
    expect(s.day).toBe('2026-11-25')
    expect(s.log).toEqual({})
    expect(s.history['2026-11-24'].gym.status).toBe('done')
  })
  it('corrupt save is kept aside and replaced', () => {
    const st = fake()
    st.setItem(KEY, '{nope')
    expect(load(st, NOW).day).toBe('2026-11-25')
    expect(st.m.get(KEY + ':corrupt')).toBe('{nope')
  })
})
