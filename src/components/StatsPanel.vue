<script setup lang="ts">
import type { LineStats } from '../engine/game'
import { PIECE_TYPES } from '../engine/tetrominoes'
import type { PieceType } from '../engine/types'
import { tetrisRate } from '../format'
import PieceIcon from './PieceIcon.vue'

defineProps<{
  pieceStats: Record<PieceType, number>
  lineStats: LineStats
  lines: number
}>()

const LINE_LABELS: { key: keyof LineStats; label: string }[] = [
  { key: 'single', label: 'Single' },
  { key: 'double', label: 'Double' },
  { key: 'triple', label: 'Triple' },
  { key: 'tetris', label: 'Tetris' },
]
</script>

<template>
  <div class="stats-panel">
    <section class="panel">
      <h2 class="panel__title">Pièces</h2>
      <ul class="pieces">
        <li v-for="type in PIECE_TYPES" :key="type" class="pieces__row">
          <span class="pieces__icon"><PieceIcon :type="type" /></span>
          <span class="pieces__count">{{ pieceStats[type] }}</span>
        </li>
      </ul>
    </section>

    <section class="panel">
      <h2 class="panel__title">Lignes</h2>
      <dl class="lines">
        <div v-for="{ key, label } in LINE_LABELS" :key="key" class="lines__row">
          <dt>{{ label }}</dt>
          <dd>{{ lineStats[key] }}</dd>
        </div>
        <div class="lines__row lines__row--rate">
          <dt>Taux tetris</dt>
          <dd>{{ tetrisRate(lineStats.tetris, lines) }} %</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pieces {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.pieces__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pieces__icon {
  height: 18px;
  width: 48px;
  display: flex;
  justify-content: center;
}

.pieces__count {
  font-weight: 700;
}

.lines {
  margin: 0;
  display: grid;
  gap: 6px;
}

.lines__row {
  display: flex;
  justify-content: space-between;
}

.lines__row dt {
  color: var(--text-muted);
}

.lines__row dd {
  margin: 0;
  font-weight: 700;
}

.lines__row--rate {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}
</style>
