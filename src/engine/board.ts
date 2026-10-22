import type { Board, PieceType, Point } from './types'

export const BOARD_WIDTH = 10
export const BOARD_HEIGHT = 20

/** Creates an empty board of `BOARD_HEIGHT` rows by `BOARD_WIDTH` columns. */
export const createBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array<null>(BOARD_WIDTH).fill(null))

/** Cells above the top row (negative `y`) are free; walls and floor are solid. */
export const collides = (board: Board, cells: readonly Point[]): boolean =>
  cells.some(
    ({ x, y }) => x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT || (y >= 0 && board[y]![x] !== null),
  )

/** Returns a new board with the given cells filled; cells above the top row are dropped. */
export const placeCells = (board: Board, cells: readonly Point[], type: PieceType): Board => {
  const next = board.map((row) => [...row])
  for (const { x, y } of cells) {
    if (y >= 0) next[y]![x] = type
  }
  return next
}

/** Indexes of complete rows, top to bottom. */
export const findFullRows = (board: Board): number[] =>
  board.flatMap((row, index) => (row.every((cell) => cell !== null) ? [index] : []))

/** Returns a new board without the given rows, shifted down and refilled with empty rows on top. */
export const removeRows = (board: Board, rows: readonly number[]): Board => {
  const kept = board.filter((_, index) => !rows.includes(index))
  const emptyRows = Array.from({ length: rows.length }, () => Array<null>(BOARD_WIDTH).fill(null))
  return [...emptyRows, ...kept]
}
