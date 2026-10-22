<script setup lang="ts">
import { formatNumber } from '../format'
import type { HighScore } from '../storage/highScores'

defineProps<{ scores: readonly HighScore[]; highlight?: number | null }>()
</script>

<template>
  <ol v-if="scores.length > 0" class="high-scores">
    <li
      v-for="(entry, index) in scores"
      :key="`${entry.date}-${index}`"
      class="high-scores__row"
      :class="{ 'high-scores__row--highlight': index === highlight }"
    >
      <span class="high-scores__rank">{{ index + 1 }}</span>
      <span class="high-scores__name">{{ entry.name }}</span>
      <span class="high-scores__level">N{{ entry.level }}</span>
      <span class="high-scores__score">{{ formatNumber(entry.score) }}</span>
    </li>
  </ol>
  <p v-else class="high-scores__empty">Aucun score pour l'instant.</p>
</template>

<style scoped>
.high-scores {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
  font-size: 0.85rem;
}

.high-scores__row {
  display: grid;
  grid-template-columns: 1.5em minmax(0, 1fr) auto auto;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 8px;
}

.high-scores__row--highlight {
  background: var(--accent);
  color: var(--accent-text);
}

.high-scores__rank,
.high-scores__level {
  opacity: 0.6;
}

.high-scores__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.high-scores__score {
  font-weight: 700;
  text-align: right;
}

.high-scores__empty {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
