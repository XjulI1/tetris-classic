<script setup lang="ts">
import { computed } from 'vue'
import { spawnShape } from '../engine/tetrominoes'
import type { PieceType } from '../engine/types'

const props = defineProps<{ type: PieceType }>()

const cells = computed(() => spawnShape(props.type))

const box = computed(() => {
  const xs = cells.value.map(({ x }) => x)
  const ys = cells.value.map(({ y }) => y)
  const left = Math.min(...xs)
  const top = Math.min(...ys)
  return { left, top, width: Math.max(...xs) - left + 1, height: Math.max(...ys) - top + 1 }
})
</script>

<template>
  <svg
    class="piece-icon"
    :viewBox="`${box.left} ${box.top} ${box.width} ${box.height}`"
    :style="{ aspectRatio: `${box.width} / ${box.height}`, fill: `var(--piece-${type})` }"
    aria-hidden="true"
  >
    <rect
      v-for="cell in cells"
      :key="`${cell.x},${cell.y}`"
      :x="cell.x + 0.05"
      :y="cell.y + 0.05"
      width="0.9"
      height="0.9"
      rx="0.18"
    />
  </svg>
</template>

<style scoped>
.piece-icon {
  display: block;
  height: 100%;
  max-width: 100%;
}
</style>
