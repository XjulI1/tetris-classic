import { BOARD_HEIGHT, BOARD_WIDTH } from '../engine/board'
import type { TetrisGame } from '../engine/game'
import { pieceCells } from '../engine/tetrominoes'
import type { Point } from '../engine/types'
import type { BoardPalette } from './palette'

export type BoardView = Pick<TetrisGame, 'board' | 'active' | 'clearingRows' | 'clearProgress' | 'status'>

const CELL_GAP_RATIO = 0.08
const CELL_RADIUS_RATIO = 0.18
const HIGHLIGHT_ALPHA = 0.22
const GAME_OVER_ALPHA = 0.35
const FLASH_MAX_ALPHA = 0.7
const BOARD_CENTER_X = (BOARD_WIDTH - 1) / 2

const drawCell = (context: CanvasRenderingContext2D, { x, y }: Point, cellSize: number, color: string) => {
  const gap = cellSize * CELL_GAP_RATIO
  const size = cellSize - gap
  const left = x * cellSize + gap / 2
  const top = y * cellSize + gap / 2
  context.fillStyle = color
  context.beginPath()
  context.roundRect(left, top, size, size, cellSize * CELL_RADIUS_RATIO)
  context.fill()
  context.fillStyle = `rgb(255 255 255 / ${HIGHLIGHT_ALPHA})`
  context.beginPath()
  context.roundRect(left, top, size, size * 0.28, [cellSize * CELL_RADIUS_RATIO, cellSize * CELL_RADIUS_RATIO, 0, 0])
  context.fill()
}

const drawGrid = (context: CanvasRenderingContext2D, cellSize: number, color: string) => {
  context.strokeStyle = color
  context.lineWidth = Math.max(1, cellSize * 0.03)
  context.beginPath()
  for (let x = 1; x < BOARD_WIDTH; x++) {
    context.moveTo(x * cellSize, 0)
    context.lineTo(x * cellSize, BOARD_HEIGHT * cellSize)
  }
  for (let y = 1; y < BOARD_HEIGHT; y++) {
    context.moveTo(0, y * cellSize)
    context.lineTo(BOARD_WIDTH * cellSize, y * cellSize)
  }
  context.stroke()
}

const isWipedOut = (x: number, progress: number) => Math.abs(x - BOARD_CENTER_X) < progress * (BOARD_WIDTH / 2)

/** Draws the stack, the falling piece and the line clear animation, which wipes rows from the center outward. */
export const drawBoard = (
  context: CanvasRenderingContext2D,
  view: BoardView,
  palette: BoardPalette,
  cellSize: number,
): void => {
  context.fillStyle = palette.background
  context.fillRect(0, 0, BOARD_WIDTH * cellSize, BOARD_HEIGHT * cellSize)
  drawGrid(context, cellSize, palette.grid)

  context.globalAlpha = view.status === 'over' ? GAME_OVER_ALPHA : 1
  view.board.forEach((row, y) => {
    const clearing = view.clearingRows.includes(y)
    row.forEach((cell, x) => {
      if (cell === null || (clearing && isWipedOut(x, view.clearProgress))) return
      drawCell(context, { x, y }, cellSize, palette.pieces[cell])
    })
  })

  if (view.active) {
    const color = palette.pieces[view.active.type]
    for (const cell of pieceCells(view.active)) {
      if (cell.y >= 0) drawCell(context, cell, cellSize, color)
    }
  }
  context.globalAlpha = 1

  if (view.clearingRows.length > 0) {
    context.fillStyle = palette.flash
    context.globalAlpha = FLASH_MAX_ALPHA * (1 - view.clearProgress)
    for (const y of view.clearingRows) context.fillRect(0, y * cellSize, BOARD_WIDTH * cellSize, cellSize)
    context.globalAlpha = 1
  }
}
