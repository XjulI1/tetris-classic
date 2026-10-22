import { describe, expect, it } from 'vitest'
import { BOARD_HEIGHT } from './board'
import { LINE_CLEAR_DURATION_MS, TetrisGame, type GameEvent } from './game'
import { gravityInterval, softDropDelay } from './gravity'
import { boardFromRows, bottomRows, cyclePieces } from './testing/boards'
import type { PieceType } from './types'

const createGame = (pieces: PieceType[], startLevel = 0) =>
  new TetrisGame({ startLevel, pieceSource: cyclePieces(pieces) })

const recordEvents = (game: TetrisGame) => {
  const events: GameEvent['type'][] = []
  game.onEvent((event) => events.push(event.type))
  return events
}

const FRAME_MS = 1000 / 60

const advance = (game: TetrisGame, durationMs: number) => {
  for (let elapsed = 0; elapsed < durationMs; elapsed += FRAME_MS) game.tick(FRAME_MS)
}

const standIUpAgainstRightWall = (game: TetrisGame) => {
  game.rotate(1)
  while (game.moveRight());
}

describe('TetrisGame', () => {
  describe('spawning', () => {
    it('spawns the first piece centered at the top and previews the next one', () => {
      const game = createGame(['T', 'L'])
      expect(game.active).toEqual({ type: 'T', rotation: 0, x: 5, y: 0 })
      expect(game.next).toBe('L')
    })

    it('counts every spawned piece in the statistics', () => {
      const game = createGame(['O', 'I'])
      game.hardDrop()
      expect(game.pieceStats).toMatchObject({ O: 1, I: 1, T: 0 })
    })
  })

  describe('moving', () => {
    it('shifts until the wall stops it', () => {
      const game = createGame(['I'])
      expect([game.moveLeft(), game.moveLeft(), game.moveLeft(), game.moveLeft()]).toEqual([true, true, true, false])
      expect(game.active?.x).toBe(2)
    })

    it('emits a move event only when the piece actually moves', () => {
      const game = createGame(['I'])
      const events = recordEvents(game)
      while (game.moveRight());
      expect(events).toEqual(['move', 'move', 'move'])
    })

    it('is blocked by the stack', () => {
      const game = createGame(['O'])
      game.board = boardFromRows(Array(BOARD_HEIGHT).fill('.......T..'))
      expect(game.moveRight()).toBe(true)
      expect(game.moveRight()).toBe(false)
    })
  })

  describe('rotating', () => {
    it('cycles through orientations in both directions', () => {
      const game = createGame(['T'])
      game.rotate(-1)
      expect(game.active?.rotation).toBe(3)
      game.rotate(1)
      game.rotate(1)
      expect(game.active?.rotation).toBe(1)
    })

    it('does not rotate the O piece', () => {
      const game = createGame(['O'])
      expect(game.rotate(1)).toBe(false)
    })

    it('has no wall kicks: a rotation into the wall is refused', () => {
      const game = createGame(['I'])
      standIUpAgainstRightWall(game)
      expect(game.rotate(1)).toBe(false)
      expect(game.active?.rotation).toBe(1)
    })
  })

  describe('gravity', () => {
    it('drops the piece one row per gravity interval of the current level', () => {
      const game = createGame(['T'], 5)
      game.tick(gravityInterval(5) - 1)
      expect(game.active?.y).toBe(0)
      game.tick(1)
      expect(game.active?.y).toBe(1)
    })

    it('locks the piece when it cannot fall any further, then spawns the next one', () => {
      const game = createGame(['O', 'T'], 19)
      const events = recordEvents(game)
      game.tick(gravityInterval(19) * BOARD_HEIGHT)
      expect(bottomRows(game.board, 2)).toEqual(['....OO....', '....OO....'])
      expect(events).toContain('lock')
      expect(game.active?.type).toBe('T')
    })

    it('soft drop moves one row immediately and scores one point per row', () => {
      const game = createGame(['T'])
      game.setSoftDrop(true)
      game.tick(0)
      expect(game.active?.y).toBe(1)
      expect(game.score).toBe(1)
    })

    it('soft drop pauses after the first row, then accelerates', () => {
      const game = createGame(['T'])
      game.setSoftDrop(true)
      game.tick(0)
      game.tick(softDropDelay(1) - 1)
      expect(game.active?.y).toBe(1)
      game.tick(1)
      expect(game.active?.y).toBe(2)
      game.tick(softDropDelay(2))
      game.tick(softDropDelay(3))
      expect(game.active?.y).toBe(4)
    })

    it('goes back to normal speed when soft drop is released', () => {
      const game = createGame(['T'])
      game.setSoftDrop(true)
      game.tick(0)
      game.setSoftDrop(false)
      game.tick(gravityInterval(0) - 1)
      expect(game.active?.y).toBe(1)
    })

    it('stops soft dropping when the piece locks, so the next piece needs a new press', () => {
      const game = createGame(['O', 'T'])
      game.setSoftDrop(true)
      advance(game, 1100)
      expect(bottomRows(game.board, 2)).toEqual(['....OO....', '....OO....'])
      expect(game.active).toMatchObject({ type: 'T', y: 0 })
      advance(game, 300)
      expect(game.active?.y).toBe(0)

      game.setSoftDrop(true)
      game.tick(0)
      expect(game.active?.y).toBe(1)
    })
  })

  describe('hard drop', () => {
    it('drops and locks immediately, scoring two points per row', () => {
      const game = createGame(['I'])
      game.hardDrop()
      expect(bottomRows(game.board, 1)).toEqual(['...IIII...'])
      expect(game.score).toBe((BOARD_HEIGHT - 1) * 2)
    })
  })

  describe('line clears', () => {
    it('pauses on full rows for the clear animation, then removes them', () => {
      const game = createGame(['I'])
      game.board = boardFromRows(['J.........', 'LLL....SSS'])
      const events = recordEvents(game)
      game.hardDrop()
      expect(game.status).toBe('clearing')
      expect(game.clearingRows).toEqual([BOARD_HEIGHT - 1])
      expect(game.active).toBeNull()
      expect(events).toEqual(['hardDrop', 'lock', 'lineClear'])

      game.tick(LINE_CLEAR_DURATION_MS / 2)
      expect(game.clearProgress).toBeCloseTo(0.5)

      game.tick(LINE_CLEAR_DURATION_MS / 2)
      expect(game.status).toBe('playing')
      expect(bottomRows(game.board, 2)).toEqual(['..........', 'J.........'])
      expect(game.lines).toBe(1)
      expect(game.lineStats.single).toBe(1)
      expect(game.active?.type).toBe('I')
    })

    it('scores a tetris at the current level', () => {
      const game = createGame(['I'], 5)
      game.board = boardFromRows(Array(4).fill('ZZZZZZZZZ.'))
      standIUpAgainstRightWall(game)
      game.hardDrop()
      const dropPoints = game.score
      game.tick(LINE_CLEAR_DURATION_MS)
      expect(game.score - dropPoints).toBe(1200 * 6)
      expect(game.lineStats.tetris).toBe(1)
      expect(game.lines).toBe(4)
    })

    it('levels up every 10 lines', () => {
      const game = createGame(['I'])
      game.lines = 9
      game.board = boardFromRows(['LLL....SSS'])
      const events = recordEvents(game)
      game.hardDrop()
      game.tick(LINE_CLEAR_DURATION_MS)
      expect(game.level).toBe(1)
      expect(events).toContain('levelUp')
    })

    it('scores with the level reached before the clear', () => {
      const game = createGame(['I'])
      game.lines = 9
      game.board = boardFromRows(['LLL....SSS'])
      game.hardDrop()
      const dropPoints = game.score
      game.tick(LINE_CLEAR_DURATION_MS)
      expect(game.score - dropPoints).toBe(40)
    })
  })

  describe('game over', () => {
    it('ends when the next piece cannot spawn', () => {
      const game = createGame(['O'])
      game.board = boardFromRows(Array(BOARD_HEIGHT - 2).fill('....OO....'))
      const events = recordEvents(game)
      game.hardDrop()
      expect(game.status).toBe('over')
      expect(events).toContain('gameOver')
    })

    it('ignores every action once over', () => {
      const game = createGame(['O'])
      game.board = boardFromRows(Array(BOARD_HEIGHT - 2).fill('....OO....'))
      game.hardDrop()
      const board = game.board
      expect(game.moveLeft()).toBe(false)
      game.hardDrop()
      game.tick(10_000)
      expect(game.board).toBe(board)
    })
  })
})
