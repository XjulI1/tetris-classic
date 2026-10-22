import { describe, expect, it } from 'vitest'
import { createNesRandomizer } from './randomizer'
import { PIECE_TYPES } from './tetrominoes'

const rollFor = (index: number, sides: number) => (index + 0.5) / sides

const sequence = (values: number[]) => () => {
  const value = values.shift()
  if (value === undefined) throw new Error('Random sequence exhausted')
  return value
}

describe('createNesRandomizer', () => {
  it('returns the piece rolled among eight values', () => {
    const next = createNesRandomizer(sequence([rollFor(2, 8)]))
    expect(next()).toBe(PIECE_TYPES[2])
  })

  it('rerolls among the seven pieces when the dummy value is rolled', () => {
    const next = createNesRandomizer(sequence([rollFor(7, 8), rollFor(4, 7)]))
    expect(next()).toBe(PIECE_TYPES[4])
  })

  it('rerolls once when the previous piece repeats, even if the reroll repeats again', () => {
    const next = createNesRandomizer(sequence([rollFor(1, 8), rollFor(1, 8), rollFor(1, 7)]))
    expect(next()).toBe(PIECE_TYPES[1])
    expect(next()).toBe(PIECE_TYPES[1])
  })

  it('only produces the seven tetrominoes', () => {
    const next = createNesRandomizer()
    for (let draw = 0; draw < 500; draw++) {
      expect(PIECE_TYPES).toContain(next())
    }
  })
})
