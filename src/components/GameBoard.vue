<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ResolvedTheme } from '../composables/useTheme'
import { BOARD_HEIGHT, BOARD_WIDTH, createBoard } from '../engine/board'
import type { TetrisGame } from '../engine/game'
import { drawBoard, type BoardView } from '../render/drawBoard'
import { readPalette, type BoardPalette } from '../render/palette'

const props = defineProps<{ game: TetrisGame | null; theme: ResolvedTheme }>()

const EMPTY_VIEW: BoardView = { board: createBoard(), active: null, clearingRows: [], clearProgress: 0, status: 'playing' }

const canvas = ref<HTMLCanvasElement | null>(null)
let palette: BoardPalette | null = null
let animationFrame: number | null = null
let resizeObserver: ResizeObserver | null = null

const fitToDisplaySize = () => {
  const element = canvas.value
  if (!element) return
  const cellSize = Math.max(1, Math.floor((element.clientWidth * window.devicePixelRatio) / BOARD_WIDTH))
  element.width = cellSize * BOARD_WIDTH
  element.height = cellSize * BOARD_HEIGHT
}

const render = () => {
  const element = canvas.value
  const context = element?.getContext('2d')
  if (element && context && palette) {
    drawBoard(context, props.game ?? EMPTY_VIEW, palette, element.width / BOARD_WIDTH)
  }
  animationFrame = requestAnimationFrame(render)
}

onMounted(() => {
  const element = canvas.value!
  palette = readPalette(element)
  resizeObserver = new ResizeObserver(fitToDisplaySize)
  resizeObserver.observe(element)
  fitToDisplaySize()
  animationFrame = requestAnimationFrame(render)
})

watch(
  () => props.theme,
  async () => {
    await nextTick()
    if (canvas.value) palette = readPalette(canvas.value)
  },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (animationFrame !== null) cancelAnimationFrame(animationFrame)
})
</script>

<template>
  <canvas ref="canvas" class="game-board" role="img" aria-label="Plateau de jeu" />
</template>

<style scoped>
.game-board {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
