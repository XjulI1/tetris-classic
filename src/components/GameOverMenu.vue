<script setup lang="ts">
import { ref } from 'vue'
import { vAutofocus } from '../directives/autofocus'
import { formatNumber } from '../format'
import { MAX_NAME_LENGTH, type HighScore } from '../storage/highScores'
import BoardOverlay from './BoardOverlay.vue'
import HighScoreTable from './HighScoreTable.vue'

const props = defineProps<{
  score: number
  lines: number
  level: number
  qualifies: boolean
  highScores: readonly HighScore[]
  savedRank: number | null
  defaultName: string
}>()

const emit = defineEmits<{ save: [name: string]; restart: []; menu: [] }>()

const name = ref(props.defaultName)
</script>

<template>
  <BoardOverlay title="Partie terminée">
    <dl class="summary">
      <div class="summary__item summary__item--main">
        <dt>Score</dt>
        <dd>{{ formatNumber(score) }}</dd>
      </div>
      <div class="summary__item">
        <dt>Lignes</dt>
        <dd>{{ lines }}</dd>
      </div>
      <div class="summary__item">
        <dt>Niveau</dt>
        <dd>{{ level }}</dd>
      </div>
    </dl>

    <form v-if="qualifies && savedRank === null" class="entry" @submit.prevent="emit('save', name)">
      <label class="entry__label" for="player-name">Nouveau record ! Ton nom :</label>
      <div class="entry__row">
        <input
          id="player-name"
          v-model="name"
          v-autofocus
          class="entry__input"
          :maxlength="MAX_NAME_LENGTH"
          autocomplete="nickname"
          enterkeyhint="done"
        />
        <button type="submit" class="button button--primary">OK</button>
      </div>
    </form>

    <template v-else>
      <HighScoreTable :scores="highScores" :highlight="savedRank" />
      <button type="button" class="button button--primary" v-autofocus @click="emit('restart')">Rejouer</button>
      <button type="button" class="button" @click="emit('menu')">Menu</button>
    </template>
  </BoardOverlay>
</template>

<style scoped>
.summary {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  text-align: center;
}

.summary__item--main {
  grid-column: 1 / -1;
}

.summary__item dt {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.summary__item dd {
  margin: 2px 0 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.summary__item--main dd {
  font-size: 2rem;
  color: var(--accent);
}

.entry {
  display: grid;
  gap: 8px;
}

.entry__label {
  font-weight: 600;
  text-align: center;
}

.entry__row {
  display: flex;
  gap: 8px;
}

.entry__input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 16px;
}
</style>
