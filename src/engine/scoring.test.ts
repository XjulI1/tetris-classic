import { describe, expect, it } from 'vitest'
import { levelForLines, lineClearScore } from './scoring'

describe('lineClearScore', () => {
  it.each([
    [1, 0, 40],
    [2, 0, 100],
    [3, 0, 300],
    [4, 0, 1200],
    [4, 9, 12000],
    [1, 19, 800],
  ])('scores %i line(s) at level %i as %i points', (lines, level, expected) => {
    expect(lineClearScore(lines, level)).toBe(expected)
  })

  it('scores nothing without lines', () => {
    expect(lineClearScore(0, 5)).toBe(0)
  })
})

describe('levelForLines', () => {
  it('levels up every 10 lines from level 0', () => {
    expect(levelForLines(0, 9)).toBe(0)
    expect(levelForLines(0, 10)).toBe(1)
    expect(levelForLines(0, 35)).toBe(3)
  })

  it('stays on the starting level until enough lines are cleared to catch up', () => {
    expect(levelForLines(5, 59)).toBe(5)
    expect(levelForLines(5, 60)).toBe(6)
    expect(levelForLines(5, 70)).toBe(7)
  })
})
