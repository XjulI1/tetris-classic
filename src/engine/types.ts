export type PieceType = 'T' | 'J' | 'Z' | 'O' | 'S' | 'L' | 'I'

export type Cell = PieceType | null

export type Board = Cell[][]

export type Point = { x: number; y: number }

export type ActivePiece = {
  type: PieceType
  rotation: number
  x: number
  y: number
}

export type Random = () => number
