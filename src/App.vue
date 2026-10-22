<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SoundEngine } from './audio/soundEngine'
import GameBoard from './components/GameBoard.vue'
import GameOverMenu from './components/GameOverMenu.vue'
import PauseMenu from './components/PauseMenu.vue'
import ScorePanel from './components/ScorePanel.vue'
import StartMenu from './components/StartMenu.vue'
import StatsPanel from './components/StatsPanel.vue'
import TopBar from './components/TopBar.vue'
import TouchControls from './components/TouchControls.vue'
import { useKeyboardControls } from './composables/useKeyboardControls'
import { useSettings } from './composables/useSettings'
import { useTetrisSession } from './composables/useTetrisSession'
import { useTheme } from './composables/useTheme'
import { PIECE_TYPES } from './engine/tetrominoes'
import type { PieceType } from './engine/types'
import {
  insertHighScore,
  loadHighScores,
  normalizeName,
  qualifiesForHighScores,
  saveHighScores,
} from './storage/highScores'

const settings = useSettings()
const { preference, resolvedTheme, cycleTheme } = useTheme()

const sound = new SoundEngine()
sound.setMuted(settings.muted)

const session = useTetrisSession(sound)
const { game, hud, status } = session

const highScores = ref(loadHighScores())
const savedRank = ref<number | null>(null)
const qualifies = ref(false)

const EMPTY_PIECE_STATS = Object.fromEntries(PIECE_TYPES.map((type) => [type, 0])) as Record<PieceType, number>
const EMPTY_LINE_STATS = { single: 0, double: 0, triple: 0, tetris: 0 }

const best = computed(() => Math.max(highScores.value[0]?.score ?? 0, hud.value?.score ?? 0))

const start = () => {
  savedRank.value = null
  session.start(settings.startLevel)
}

const toggleMute = () => {
  settings.muted = !settings.muted
  sound.setMuted(settings.muted)
}

const saveScore = (name: string) => {
  if (!hud.value) return
  const playerName = normalizeName(name)
  settings.playerName = playerName
  const { scores, rank } = insertHighScore(highScores.value, {
    name: playerName,
    score: hud.value.score,
    lines: hud.value.lines,
    level: hud.value.level,
    date: new Date().toISOString(),
  })
  highScores.value = scores
  savedRank.value = rank
  saveHighScores(scores)
}

watch(status, (current) => {
  if (current === 'over') qualifies.value = qualifiesForHighScores(highScores.value, hud.value?.score ?? 0)
})

useKeyboardControls({
  press: session.press,
  release: session.release,
  togglePause: session.togglePause,
  toggleMute,
  releaseAll: session.releaseInputs,
})
</script>

<template>
  <div class="app">
    <TopBar
      :muted="settings.muted"
      :theme="preference"
      :can-pause="status === 'playing' || status === 'paused'"
      :paused="status === 'paused'"
      @toggle-mute="toggleMute"
      @cycle-theme="cycleTheme"
      @toggle-pause="session.togglePause"
    />

    <main class="playfield">
      <aside class="side side--left">
        <StatsPanel
          :piece-stats="hud?.pieceStats ?? EMPTY_PIECE_STATS"
          :line-stats="hud?.lineStats ?? EMPTY_LINE_STATS"
          :lines="hud?.lines ?? 0"
        />
      </aside>

      <section class="well">
        <GameBoard :game="game" :theme="resolvedTheme" />
        <StartMenu
          v-if="status === 'menu'"
          v-model:start-level="settings.startLevel"
          :high-scores="highScores"
          @start="start"
        />
        <PauseMenu v-else-if="status === 'paused'" @resume="session.resume" @quit="session.quit" />
        <GameOverMenu
          v-else-if="status === 'over' && hud"
          :score="hud.score"
          :lines="hud.lines"
          :level="hud.level"
          :qualifies="qualifies"
          :high-scores="highScores"
          :saved-rank="savedRank"
          :default-name="settings.playerName"
          @save="saveScore"
          @restart="start"
          @menu="session.quit"
        />
      </section>

      <aside class="side side--right">
        <ScorePanel
          :best="best"
          :score="hud?.score ?? 0"
          :lines="hud?.lines ?? 0"
          :level="hud?.level ?? settings.startLevel"
          :next="hud?.next ?? null"
        />
      </aside>
    </main>

    <TouchControls @press="session.press" @release="session.release" />
  </div>
</template>

<style scoped>
.app {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: env(safe-area-inset-top) calc(var(--gutter) + env(safe-area-inset-right)) 12px
    calc(var(--gutter) + env(safe-area-inset-left));
  max-width: 1100px;
  margin: 0 auto;
}

.playfield {
  --side-width: 190px;
  --gap: 24px;
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: var(--gap);
}

.side {
  width: var(--side-width);
  flex: none;
}

.well {
  position: relative;
  flex: none;
  height: min(100%, calc((100vw - 2 * var(--gutter) - 2 * (var(--side-width) + var(--gap))) * 2));
  aspect-ratio: 1 / 2;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}

@media (max-width: 720px) {
  .playfield {
    --side-width: 92px;
    --gap: 12px;
  }

  .side--left {
    display: none;
  }

  .well {
    height: min(100%, calc((100vw - 2 * var(--gutter) - var(--side-width) - var(--gap)) * 2));
  }
}
</style>
