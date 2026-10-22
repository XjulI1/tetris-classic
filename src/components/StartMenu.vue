<script setup lang="ts">
import { vAutofocus } from '../directives/autofocus'
import type { HighScore } from '../storage/highScores'
import { MAX_START_LEVEL } from '../storage/settings'
import BoardOverlay from './BoardOverlay.vue'
import HighScoreTable from './HighScoreTable.vue'

defineProps<{ highScores: readonly HighScore[] }>()
const startLevel = defineModel<number>('startLevel', { required: true })
const emit = defineEmits<{ start: [] }>()

const LEVELS = Array.from({ length: MAX_START_LEVEL + 1 }, (_, level) => level)
</script>

<template>
  <BoardOverlay title="TETRIS" align="top">
    <div class="start-menu">
      <section>
        <h3 class="section-title">Niveau de départ</h3>
        <div class="levels" role="radiogroup" aria-label="Niveau de départ">
          <button
            v-for="level in LEVELS"
            :key="level"
            type="button"
            role="radio"
            class="levels__option"
            :class="{ 'levels__option--selected': level === startLevel }"
            :aria-checked="level === startLevel"
            @click="startLevel = level"
          >
            {{ level }}
          </button>
        </div>
      </section>

      <button type="button" class="button button--primary" v-autofocus @click="emit('start')">Jouer</button>

      <section>
        <h3 class="section-title">Meilleurs scores</h3>
        <HighScoreTable :scores="highScores" />
      </section>

      <section class="help">
        <h3 class="section-title">Commandes</h3>
        <dl class="help__keys">
          <dt>← →</dt>
          <dd>Déplacer</dd>
          <dt>↓</dt>
          <dd>Descente rapide</dd>
          <dt>Espace</dt>
          <dd>Chute instantanée</dd>
          <dt>↑ / X</dt>
          <dd>Rotation horaire</dd>
          <dt>Z / W</dt>
          <dd>Rotation anti-horaire</dd>
          <dt>P / Échap</dt>
          <dd>Pause</dd>
          <dt>M</dt>
          <dd>Couper le son</dd>
        </dl>
      </section>
    </div>
  </BoardOverlay>
</template>

<style scoped>
.start-menu {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 8px;
}

.section-title {
  margin: 0 0 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.levels {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.levels__option {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 0;
  background: var(--surface);
  font-weight: 700;
}

.levels__option--selected {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-text);
}

.help__keys {
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  font-size: 0.8rem;
}

.help__keys dt {
  font-weight: 700;
}

.help__keys dd {
  margin: 0;
  color: var(--text-muted);
}

@media (pointer: coarse) {
  .help {
    display: none;
  }
}
</style>
