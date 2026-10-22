import { BOARD_WIDTH, collides, createBoard, findFullRows, placeCells, removeRows } from './board'
import { gravityInterval, softDropDelay } from './gravity'
import { createNesRandomizer } from './randomizer'
import { HARD_DROP_POINTS_PER_ROW, SOFT_DROP_POINTS_PER_ROW, levelForLines, lineClearScore } from './scoring'
import { PIECE_TYPES, pieceCells, rotationCount } from './tetrominoes'
import type { ActivePiece, Board, PieceType } from './types'

export const LINE_CLEAR_DURATION_MS = 350

const TIMING_TOLERANCE_MS = 1e-6

const SPAWN_X = Math.floor(BOARD_WIDTH / 2)
const SPAWN_Y = 0

export type GameStatus = 'playing' | 'clearing' | 'over'

export type RotationDirection = 1 | -1

export type GameEvent =
  | { type: 'move' }
  | { type: 'rotate' }
  | { type: 'lock' }
  | { type: 'hardDrop'; rows: number }
  | { type: 'lineClear'; rows: readonly number[] }
  | { type: 'levelUp'; level: number }
  | { type: 'gameOver' }

export type LineStats = { single: number; double: number; triple: number; tetris: number }

export type GameOptions = {
  startLevel?: number
  pieceSource?: () => PieceType
}

const LINE_STAT_KEYS = ['single', 'double', 'triple', 'tetris'] as const

const emptyPieceStats = (): Record<PieceType, number> =>
  Object.fromEntries(PIECE_TYPES.map((type) => [type, 0])) as Record<PieceType, number>

/** Framework-agnostic Tetris game following NES rules, driven by `tick` and player actions. */
export class TetrisGame {
  board: Board = createBoard()
  active: ActivePiece | null = null
  next: PieceType
  score = 0
  lines = 0
  level: number
  readonly startLevel: number
  status: GameStatus = 'playing'
  clearingRows: readonly number[] = []
  pieceStats = emptyPieceStats()
  lineStats: LineStats = { single: 0, double: 0, triple: 0, tetris: 0 }

  private readonly drawPiece: () => PieceType
  private readonly listeners = new Set<(event: GameEvent) => void>()
  private gravityElapsed = 0
  private clearElapsed = 0
  private softDropping = false
  private softDropRows = 0
  private softDropWait = 0

  constructor({ startLevel = 0, pieceSource = createNesRandomizer() }: GameOptions = {}) {
    this.startLevel = startLevel
    this.level = startLevel
    this.drawPiece = pieceSource
    this.next = this.drawPiece()
    this.spawn()
  }

  /** Progress of the line clear animation, from 0 to 1. */
  get clearProgress(): number {
    return Math.min(1, this.clearElapsed / LINE_CLEAR_DURATION_MS)
  }

  /** Subscribes to game events and returns an unsubscribe function. */
  onEvent(listener: (event: GameEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  moveLeft(): boolean {
    return this.shift(-1)
  }

  moveRight(): boolean {
    return this.shift(1)
  }

  rotate(direction: RotationDirection): boolean {
    if (!this.canAct(this.active)) return false
    const count = rotationCount(this.active.type)
    if (count === 1) return false
    const rotated = { ...this.active, rotation: (this.active.rotation + direction + count) % count }
    if (collides(this.board, pieceCells(rotated))) return false
    this.active = rotated
    this.emit({ type: 'rotate' })
    return true
  }

  /**
   * Starts or stops soft dropping. A press drops one row right away, then accelerates while held.
   * It stops when the piece locks: the next piece needs a new press.
   */
  setSoftDrop(enabled: boolean): void {
    if (enabled && !this.softDropping) {
      this.softDropRows = 0
      this.softDropWait = 0
    }
    this.softDropping = enabled
  }

  hardDrop(): void {
    if (!this.canAct(this.active)) return
    let rows = 0
    while (this.tryMoveDown()) rows++
    this.score += rows * HARD_DROP_POINTS_PER_ROW
    this.emit({ type: 'hardDrop', rows })
    this.lock()
  }

  /** Advances time by `deltaMs`: applies gravity or progresses the line clear animation. */
  tick(deltaMs: number): void {
    if (this.status === 'clearing') {
      this.clearElapsed += deltaMs
      if (this.clearElapsed + TIMING_TOLERANCE_MS >= LINE_CLEAR_DURATION_MS) this.finishLineClear()
      return
    }
    if (this.status !== 'playing') return
    this.applySoftDrop(deltaMs)
    this.applyGravity(deltaMs)
  }

  private emit(event: GameEvent): void {
    for (const listener of this.listeners) listener(event)
  }

  private canAct(piece: ActivePiece | null): piece is ActivePiece {
    return this.status === 'playing' && piece !== null
  }

  private applySoftDrop(deltaMs: number): void {
    if (!this.softDropping) return
    this.softDropWait -= deltaMs
    while (this.status === 'playing' && this.softDropping && this.softDropWait <= TIMING_TOLERANCE_MS) {
      this.softDropRows++
      this.softDropWait += softDropDelay(this.softDropRows)
      this.gravityElapsed = 0
      this.softDropStep()
    }
  }

  private applyGravity(deltaMs: number): void {
    this.gravityElapsed += deltaMs
    const interval = gravityInterval(this.level)
    while (this.status === 'playing' && this.gravityElapsed + TIMING_TOLERANCE_MS >= interval) {
      this.gravityElapsed -= interval
      this.fall()
    }
  }

  private shift(dx: number): boolean {
    if (!this.canAct(this.active)) return false
    const moved = { ...this.active, x: this.active.x + dx }
    if (collides(this.board, pieceCells(moved))) return false
    this.active = moved
    this.emit({ type: 'move' })
    return true
  }

  private tryMoveDown(): boolean {
    if (!this.active) return false
    const moved = { ...this.active, y: this.active.y + 1 }
    if (collides(this.board, pieceCells(moved))) return false
    this.active = moved
    return true
  }

  private fall(): void {
    if (!this.tryMoveDown()) this.lock()
  }

  private softDropStep(): void {
    if (this.tryMoveDown()) this.score += SOFT_DROP_POINTS_PER_ROW
    else this.lock()
  }

  private lock(): void {
    if (!this.active) return
    const cells = pieceCells(this.active)
    this.board = placeCells(this.board, cells, this.active.type)
    this.active = null
    this.gravityElapsed = 0
    this.softDropping = false
    if (cells.some(({ y }) => y < 0)) {
      this.endGame()
      return
    }
    this.emit({ type: 'lock' })
    const fullRows = findFullRows(this.board)
    if (fullRows.length === 0) {
      this.spawn()
      return
    }
    this.status = 'clearing'
    this.clearingRows = fullRows
    this.clearElapsed = 0
    this.emit({ type: 'lineClear', rows: fullRows })
  }

  private finishLineClear(): void {
    const cleared = this.clearingRows.length
    this.board = removeRows(this.board, this.clearingRows)
    this.clearingRows = []
    this.score += lineClearScore(cleared, this.level)
    this.lines += cleared
    const statKey = LINE_STAT_KEYS[cleared - 1]
    if (statKey) this.lineStats[statKey]++
    const newLevel = levelForLines(this.startLevel, this.lines)
    if (newLevel > this.level) {
      this.level = newLevel
      this.emit({ type: 'levelUp', level: newLevel })
    }
    this.status = 'playing'
    this.spawn()
  }

  private spawn(): void {
    const piece: ActivePiece = { type: this.next, rotation: 0, x: SPAWN_X, y: SPAWN_Y }
    this.next = this.drawPiece()
    this.pieceStats[piece.type]++
    this.active = piece
    if (collides(this.board, pieceCells(piece))) this.endGame()
  }

  private endGame(): void {
    this.status = 'over'
    this.emit({ type: 'gameOver' })
  }
}
