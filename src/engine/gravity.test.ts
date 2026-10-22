import { describe, expect, it } from 'vitest'
import { MAX_SPEED_LEVEL, SOFT_DROP_FASTEST_INTERVAL_MS, gravityInterval, softDropDelay } from './gravity'

const frames = (count: number) => (count * 1000) / 60

describe('gravityInterval', () => {
  it('follows the NES frames-per-row curve', () => {
    expect(gravityInterval(0)).toBeCloseTo(frames(48))
    expect(gravityInterval(8)).toBeCloseTo(frames(8))
    expect(gravityInterval(9)).toBeCloseTo(frames(6))
    expect(gravityInterval(18)).toBeCloseTo(frames(3))
  })

  it('stops speeding up after level 19 to stay playable', () => {
    expect(MAX_SPEED_LEVEL).toBe(19)
    expect(gravityInterval(19)).toBeCloseTo(frames(2))
    expect(gravityInterval(29)).toBe(gravityInterval(19))
  })

  it('never falls slower than soft drop once at max speed', () => {
    expect(gravityInterval(MAX_SPEED_LEVEL)).toBeLessThanOrEqual(SOFT_DROP_FASTEST_INTERVAL_MS)
  })
})

describe('softDropDelay', () => {
  it('pauses after the first row so that a tap nudges the piece by one cell', () => {
    expect(softDropDelay(1)).toBe(120)
  })

  it('speeds up with every row dropped', () => {
    expect([2, 3].map(softDropDelay)).toEqual([95, 70])
  })

  it('tops out at 20 rows per second, slower than the NES to stay controllable', () => {
    expect(SOFT_DROP_FASTEST_INTERVAL_MS).toBeCloseTo(frames(3))
    expect(softDropDelay(4)).toBe(SOFT_DROP_FASTEST_INTERVAL_MS)
    expect(softDropDelay(40)).toBe(SOFT_DROP_FASTEST_INTERVAL_MS)
  })
})
