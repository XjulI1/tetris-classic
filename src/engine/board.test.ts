import { describe, expect, it } from 'vitest'
import { BOARD_HEIGHT, BOARD_WIDTH, collides, createBoard, findFullRows, placeCells, removeRows } from './board'
import { boardFromRows, bottomRows } from './testing/boards'

describe('board', () => {
  it('creates an empty 10x20 board', () => {
    const board = createBoard()
    expect(board).toHaveLength(BOARD_HEIGHT)
    expect(board.every((row) => row.length === BOARD_WIDTH && row.every((cell) => cell === null))).toBe(true)
  })

  describe('collides', () => {
    const board = boardFromRows(['....O.....'])

    it('treats walls and floor as solid', () => {
      expect(collides(board, [{ x: -1, y: 0 }])).toBe(true)
      expect(collides(board, [{ x: BOARD_WIDTH, y: 0 }])).toBe(true)
      expect(collides(board, [{ x: 0, y: BOARD_HEIGHT }])).toBe(true)
    })

    it('detects occupied cells', () => {
      expect(collides(board, [{ x: 4, y: BOARD_HEIGHT - 1 }])).toBe(true)
      expect(collides(board, [{ x: 3, y: BOARD_HEIGHT - 1 }])).toBe(false)
    })

    it('lets pieces stick out above the top row', () => {
      expect(collides(board, [{ x: 4, y: -2 }])).toBe(false)
    })
  })

  it('places cells without mutating the original board', () => {
    const board = createBoard()
    const placed = placeCells(board, [{ x: 0, y: BOARD_HEIGHT - 1 }, { x: 1, y: -1 }], 'T')
    expect(bottomRows(placed, 1)).toEqual(['T.........'])
    expect(board[BOARD_HEIGHT - 1]![0]).toBeNull()
  })

  it('finds full rows from top to bottom', () => {
    const board = boardFromRows(['IIIIIIIIII', 'OO.OOOOOOO', 'TTTTTTTTTT'])
    expect(findFullRows(board)).toEqual([BOARD_HEIGHT - 3, BOARD_HEIGHT - 1])
  })

  it('removes rows and shifts the stack down', () => {
    const board = boardFromRows(['J.........', 'IIIIIIIIII', 'OO.OOOOOOO', 'TTTTTTTTTT'])
    const cleared = removeRows(board, [BOARD_HEIGHT - 3, BOARD_HEIGHT - 1])
    expect(cleared).toHaveLength(BOARD_HEIGHT)
    expect(bottomRows(cleared, 3)).toEqual(['..........', 'J.........', 'OO.OOOOOOO'])
  })
})
