import { describe, expect, it } from 'vitest'
import { tetrisRate } from './format'

describe('tetrisRate', () => {
  it('is zero before any line is cleared', () => {
    expect(tetrisRate(0, 0)).toBe(0)
  })

  it('counts the four lines of each tetris against all cleared lines', () => {
    expect(tetrisRate(2, 10)).toBe(80)
    expect(tetrisRate(1, 4)).toBe(100)
  })
})
