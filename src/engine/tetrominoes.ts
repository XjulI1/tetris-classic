import type { ActivePiece, PieceType, Point } from './types'

export const PIECE_TYPES: readonly PieceType[] = ['T', 'J', 'Z', 'O', 'S', 'L', 'I']

const turnClockwise = ({ x, y }: Point): Point => ({ x: -y || 0, y: x })

const fourWayRotations = (spawn: Point[]): Point[][] => {
  const states = [spawn]
  for (let turn = 1; turn < 4; turn++) {
    states.push(states[turn - 1]!.map(turnClockwise))
  }
  return states
}

const ROTATIONS: Record<PieceType, readonly Point[][]> = {
  T: fourWayRotations([{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }]),
  J: fourWayRotations([{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }]),
  L: fourWayRotations([{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }]),
  O: [[{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }]],
  S: [
    [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: 1 }],
    [{ x: 0, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
  ],
  Z: [
    [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    [{ x: 1, y: -1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
  ],
  I: [
    [{ x: -2, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
    [{ x: 0, y: -2 }, { x: 0, y: -1 }, { x: 0, y: 0 }, { x: 0, y: 1 }],
  ],
}

/** Number of distinct orientations a piece can take (1, 2 or 4 in the NES rotation system). */
export const rotationCount = (type: PieceType): number => ROTATIONS[type].length

/** Cells occupied by a piece in its spawn orientation, relative to its pivot. */
export const spawnShape = (type: PieceType): readonly Point[] => ROTATIONS[type][0]!

/** Absolute board cells occupied by an active piece. */
export const pieceCells = (piece: ActivePiece): Point[] =>
  ROTATIONS[piece.type][piece.rotation]!.map(({ x, y }) => ({ x: piece.x + x, y: piece.y + y }))
