import { BOARD_HEIGHT, BOARD_WIDTH, createBoard } from '../board'
import type { Board, Cell, PieceType } from '../types'

const toCell = (char: string): Cell => (char === '.' ? null : (char as PieceType))

/** Builds a board from bottom-aligned rows such as `'IIII..OOOO'`, where `.` is an empty cell. */
export const boardFromRows = (rows: readonly string[]): Board => {
  const board = createBoard()
  rows.forEach((row, index) => {
    if (row.length !== BOARD_WIDTH) throw new Error(`Row "${row}" must be ${BOARD_WIDTH} wide`)
    board[BOARD_HEIGHT - rows.length + index] = [...row].map(toCell)
  })
  return board
}

/** Renders the bottom `count` rows of a board back into the `boardFromRows` notation. */
export const bottomRows = (board: Board, count: number): string[] =>
  board.slice(BOARD_HEIGHT - count).map((row) => row.map((cell) => cell ?? '.').join(''))

/** Piece source that cycles through the given pieces in order. */
export const cyclePieces = (pieces: readonly PieceType[]): (() => PieceType) => {
  let index = 0
  return () => pieces[index++ % pieces.length]!
}
