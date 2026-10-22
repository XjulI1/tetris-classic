import { PIECE_TYPES } from './tetrominoes'
import type { PieceType, Random } from './types'

/**
 * NES piece randomizer: rolls 8 values, and rerolls once among the 7 pieces when the roll
 * is the dummy value or repeats the previous piece.
 */
export const createNesRandomizer = (random: Random = Math.random): (() => PieceType) => {
  let previous: PieceType | null = null
  return () => {
    const roll = Math.floor(random() * (PIECE_TYPES.length + 1))
    let piece = PIECE_TYPES[roll]
    if (piece === undefined || piece === previous) {
      piece = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)]!
    }
    previous = piece
    return piece
  }
}
