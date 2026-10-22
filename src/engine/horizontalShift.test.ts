import { describe, expect, it } from 'vitest'
import { HorizontalShift } from './horizontalShift'

const timing = { delayMs: 170, intervalMs: 50 }

describe('HorizontalShift', () => {
  it('follows the most recently pressed direction', () => {
    const shift = new HorizontalShift(timing)
    shift.press(-1)
    shift.press(1)
    expect(shift.direction).toBe(1)
  })

  it('falls back to the other held direction and restarts the delay', () => {
    const shift = new HorizontalShift(timing)
    shift.press(-1)
    shift.update(150)
    shift.press(1)
    shift.update(150)
    shift.release(1)
    expect(shift.direction).toBe(-1)
    expect(shift.update(169)).toBe(0)
    expect(shift.update(1)).toBe(1)
  })

  it('keeps charging the active direction when the inactive one is released', () => {
    const shift = new HorizontalShift(timing)
    shift.press(-1)
    shift.press(1)
    shift.update(100)
    shift.release(-1)
    expect(shift.direction).toBe(1)
    expect(shift.update(70)).toBe(1)
  })

  it('stops when no direction is held', () => {
    const shift = new HorizontalShift(timing)
    shift.press(1)
    shift.release(1)
    expect(shift.direction).toBeNull()
    expect(shift.update(1000)).toBe(0)
  })
})
