import { describe, expect, it } from 'vitest'
import { PIECE_TYPES, pieceCells, rotationCount } from './tetrominoes'

describe('tetrominoes', () => {
  it('every orientation of every piece has four distinct cells', () => {
    for (const type of PIECE_TYPES) {
      for (let rotation = 0; rotation < rotationCount(type); rotation++) {
        const cells = pieceCells({ type, rotation, x: 0, y: 0 })
        expect(new Set(cells.map(({ x, y }) => `${x},${y}`)).size).toBe(4)
      }
    }
  })

  it('follows the NES rotation system orientation counts', () => {
    expect(rotationCount('O')).toBe(1)
    expect(rotationCount('I')).toBe(2)
    expect(rotationCount('S')).toBe(2)
    expect(rotationCount('Z')).toBe(2)
    expect(rotationCount('T')).toBe(4)
    expect(rotationCount('J')).toBe(4)
    expect(rotationCount('L')).toBe(4)
  })

  it('spawns T pointing down, as on the NES', () => {
    expect(pieceCells({ type: 'T', rotation: 0, x: 5, y: 0 })).toEqual([
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
      { x: 5, y: 1 },
    ])
  })

  it('rotates T clockwise around its center block', () => {
    expect(pieceCells({ type: 'T', rotation: 1, x: 5, y: 5 })).toEqual([
      { x: 5, y: 4 },
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 4, y: 5 },
    ])
  })

  it('stands I vertically through its pivot column', () => {
    expect(pieceCells({ type: 'I', rotation: 1, x: 5, y: 5 }).map(({ x }) => x)).toEqual([5, 5, 5, 5])
  })
})
