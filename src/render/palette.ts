import { PIECE_TYPES } from '../engine/tetrominoes'
import type { PieceType } from '../engine/types'

export type BoardPalette = {
  background: string
  grid: string
  flash: string
  pieces: Record<PieceType, string>
}

/** Reads the board colors from the CSS custom properties currently applied to `element`. */
export const readPalette = (element: Element): BoardPalette => {
  const style = getComputedStyle(element)
  const read = (name: string) => style.getPropertyValue(name).trim()
  return {
    background: read('--board-bg'),
    grid: read('--board-grid'),
    flash: read('--board-flash'),
    pieces: Object.fromEntries(PIECE_TYPES.map((type) => [type, read(`--piece-${type}`)])) as Record<
      PieceType,
      string
    >,
  }
}
