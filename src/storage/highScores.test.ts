import { describe, expect, it } from 'vitest'
import { MAX_HIGH_SCORES, insertHighScore, normalizeName, qualifiesForHighScores, type HighScore } from './highScores'

const entry = (score: number, name = 'AAA'): HighScore => ({ name, score, lines: 0, level: 0, date: '2026-10-22' })

const fullBoard = () => Array.from({ length: MAX_HIGH_SCORES }, (_, index) => entry((MAX_HIGH_SCORES - index) * 100))

describe('qualifiesForHighScores', () => {
  it('accepts any positive score while the board is not full', () => {
    expect(qualifiesForHighScores([entry(5000)], 10)).toBe(true)
  })

  it('rejects a zero score', () => {
    expect(qualifiesForHighScores([], 0)).toBe(false)
  })

  it('requires beating the last entry once the board is full', () => {
    expect(qualifiesForHighScores(fullBoard(), 100)).toBe(false)
    expect(qualifiesForHighScores(fullBoard(), 101)).toBe(true)
  })
})

describe('insertHighScore', () => {
  it('inserts in descending order and returns the rank', () => {
    const { scores, rank } = insertHighScore([entry(300), entry(100)], entry(200, 'NEW'))
    expect(scores.map(({ score }) => score)).toEqual([300, 200, 100])
    expect(rank).toBe(1)
  })

  it('places a tie below the existing score', () => {
    const { rank } = insertHighScore([entry(200)], entry(200, 'NEW'))
    expect(rank).toBe(1)
  })

  it('keeps only the top entries', () => {
    const { scores, rank } = insertHighScore(fullBoard(), entry(550, 'NEW'))
    expect(scores).toHaveLength(MAX_HIGH_SCORES)
    expect(scores.at(-1)?.score).toBe(200)
    expect(rank).toBe(5)
  })

  it('reports no rank when the entry does not make the cut', () => {
    expect(insertHighScore(fullBoard(), entry(50)).rank).toBeNull()
  })
})

describe('normalizeName', () => {
  it('trims and caps the name length', () => {
    expect(normalizeName('  Alexandre-Julien  ')).toBe('Alexandre-Ju')
  })

  it('falls back to a placeholder for blank names', () => {
    expect(normalizeName('   ')).toBe('???')
  })
})
