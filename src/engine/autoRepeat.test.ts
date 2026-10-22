import { describe, expect, it } from 'vitest'
import { AutoRepeat } from './autoRepeat'

const timing = { delayMs: 170, intervalMs: 50 }

describe('AutoRepeat', () => {
  it('does not repeat before the delay', () => {
    const repeat = new AutoRepeat(timing)
    repeat.press()
    expect(repeat.update(169)).toBe(0)
  })

  it('repeats once the delay is reached, then at every interval', () => {
    const repeat = new AutoRepeat(timing)
    repeat.press()
    expect(repeat.update(170)).toBe(1)
    expect(repeat.update(49)).toBe(0)
    expect(repeat.update(1)).toBe(1)
  })

  it('catches up on several repeats after a long frame', () => {
    const repeat = new AutoRepeat(timing)
    repeat.press()
    expect(repeat.update(170 + 50 * 3)).toBe(4)
  })

  it('stops repeating when released', () => {
    const repeat = new AutoRepeat(timing)
    repeat.press()
    repeat.release()
    expect(repeat.isHeld).toBe(false)
    expect(repeat.update(1000)).toBe(0)
  })
})
