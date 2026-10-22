<script setup lang="ts">
import type { PieceType } from '../engine/types'
import { formatNumber } from '../format'
import PieceIcon from './PieceIcon.vue'

defineProps<{
  best: number
  score: number
  lines: number
  level: number
  next: PieceType | null
}>()
</script>

<template>
  <div class="score-panel">
    <section class="panel next">
      <h2 class="panel__title">Suivante</h2>
      <div class="next__slot">
        <PieceIcon v-if="next" :type="next" />
      </div>
    </section>

    <section class="panel">
      <dl class="figures">
        <div class="figure">
          <dt>Record</dt>
          <dd>{{ formatNumber(best) }}</dd>
        </div>
        <div class="figure figure--main">
          <dt>Score</dt>
          <dd>{{ formatNumber(score) }}</dd>
        </div>
        <div class="figure">
          <dt>Lignes</dt>
          <dd>{{ lines }}</dd>
        </div>
        <div class="figure">
          <dt>Niveau</dt>
          <dd>{{ level }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.score-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.next__slot {
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.figures {
  margin: 0;
  display: grid;
  gap: 12px;
}

.figure dt {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.figure dd {
  margin: 2px 0 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.figure--main dd {
  font-size: 1.6rem;
  color: var(--accent);
}

@media (max-width: 720px) {
  .score-panel {
    gap: 10px;
  }

  .score-panel .panel {
    padding: 10px;
  }

  .next__slot {
    height: 28px;
  }

  .figures {
    gap: 8px;
  }

  .figure dt {
    font-size: 0.62rem;
  }

  .figure dd,
  .figure--main dd {
    font-size: 1rem;
  }
}
</style>
