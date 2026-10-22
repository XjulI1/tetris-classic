import { onBeforeUnmount, ref, shallowRef } from 'vue'
import type { SoundEngine } from '../audio/soundEngine'
import { TetrisGame, type GameEvent, type LineStats } from '../engine/game'
import { HorizontalShift } from '../engine/horizontalShift'
import type { PieceType } from '../engine/types'

export type SessionStatus = 'menu' | 'playing' | 'paused' | 'over'

export type GameAction = 'left' | 'right' | 'softDrop' | 'hardDrop' | 'rotateClockwise' | 'rotateCounterClockwise'

export type HudSnapshot = {
  score: number
  lines: number
  level: number
  next: PieceType
  pieceStats: Record<PieceType, number>
  lineStats: LineStats
}

const MAX_FRAME_MS = 100

const snapshotOf = (game: TetrisGame): HudSnapshot => ({
  score: game.score,
  lines: game.lines,
  level: game.level,
  next: game.next,
  pieceStats: { ...game.pieceStats },
  lineStats: { ...game.lineStats },
})

const totalPieces = (stats: Record<PieceType, number>) => Object.values(stats).reduce((sum, count) => sum + count, 0)

const hudChanged = (previous: HudSnapshot | null, game: TetrisGame) =>
  !previous ||
  previous.score !== game.score ||
  previous.lines !== game.lines ||
  previous.level !== game.level ||
  previous.next !== game.next ||
  totalPieces(previous.pieceStats) !== totalPieces(game.pieceStats)

/** Runs a game: animation loop, player input with auto shift, sound effects and pause handling. */
export const useTetrisSession = (sound: SoundEngine) => {
  const game = shallowRef<TetrisGame | null>(null)
  const hud = shallowRef<HudSnapshot | null>(null)
  const status = ref<SessionStatus>('menu')
  const shift = new HorizontalShift()
  let unsubscribe: (() => void) | null = null
  let animationFrame: number | null = null
  let lastFrameTime: number | null = null
  let hardDropJustLanded = false

  const refreshHud = () => {
    if (game.value && hudChanged(hud.value, game.value)) hud.value = snapshotOf(game.value)
  }

  const releaseInputs = () => {
    shift.reset()
    game.value?.setSoftDrop(false)
  }

  const handleEvent = (event: GameEvent) => {
    switch (event.type) {
      case 'move':
      case 'rotate':
      case 'levelUp':
        sound.play(event.type)
        break
      case 'hardDrop':
        sound.play('hardDrop')
        hardDropJustLanded = true
        break
      case 'lock':
        if (!hardDropJustLanded) sound.play('lock')
        hardDropJustLanded = false
        break
      case 'lineClear':
        sound.play(event.rows.length === 4 ? 'tetris' : 'lineClear')
        break
      case 'gameOver':
        status.value = 'over'
        releaseInputs()
        sound.stopMusic()
        sound.play('gameOver')
        break
    }
  }

  const applyAutoShift = (current: TetrisGame, deltaMs: number) => {
    const steps = shift.update(deltaMs)
    for (let step = 0; step < steps; step++) {
      const moved = shift.direction === -1 ? current.moveLeft() : current.moveRight()
      if (!moved) break
    }
  }

  const frame = (time: number) => {
    const deltaMs = lastFrameTime === null ? 0 : Math.min(time - lastFrameTime, MAX_FRAME_MS)
    lastFrameTime = time
    const current = game.value
    if (current && status.value === 'playing') {
      applyAutoShift(current, deltaMs)
      current.tick(deltaMs)
      refreshHud()
    }
    animationFrame = requestAnimationFrame(frame)
  }

  const ensureLoop = () => {
    if (animationFrame === null) animationFrame = requestAnimationFrame(frame)
  }

  const start = (startLevel: number) => {
    sound.unlock()
    unsubscribe?.()
    const created = new TetrisGame({ startLevel })
    unsubscribe = created.onEvent(handleEvent)
    hardDropJustLanded = false
    shift.reset()
    game.value = created
    hud.value = null
    refreshHud()
    status.value = 'playing'
    lastFrameTime = null
    sound.startMusic()
    ensureLoop()
  }

  const pause = () => {
    if (status.value !== 'playing') return
    status.value = 'paused'
    releaseInputs()
    sound.pauseMusic()
  }

  const resume = () => {
    if (status.value !== 'paused') return
    sound.unlock()
    status.value = 'playing'
    lastFrameTime = null
    sound.resumeMusic()
  }

  const togglePause = () => (status.value === 'paused' ? resume() : pause())

  const quit = () => {
    unsubscribe?.()
    unsubscribe = null
    sound.stopMusic()
    releaseInputs()
    game.value = null
    hud.value = null
    status.value = 'menu'
  }

  const press = (action: GameAction) => {
    const current = game.value
    if (!current || status.value !== 'playing') return
    switch (action) {
      case 'left':
        shift.press(-1)
        current.moveLeft()
        break
      case 'right':
        shift.press(1)
        current.moveRight()
        break
      case 'softDrop':
        current.setSoftDrop(true)
        break
      case 'hardDrop':
        current.hardDrop()
        break
      case 'rotateClockwise':
        current.rotate(1)
        break
      case 'rotateCounterClockwise':
        current.rotate(-1)
        break
    }
    refreshHud()
  }

  const release = (action: GameAction) => {
    if (action === 'left') shift.release(-1)
    else if (action === 'right') shift.release(1)
    else if (action === 'softDrop') game.value?.setSoftDrop(false)
  }

  const onVisibilityChange = () => {
    if (document.hidden) pause()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
    if (animationFrame !== null) cancelAnimationFrame(animationFrame)
    unsubscribe?.()
    sound.stopMusic()
  })

  return { game, hud, status, start, pause, resume, togglePause, quit, press, release, releaseInputs }
}
