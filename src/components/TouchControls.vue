<script setup lang="ts">
import type { GameAction } from '../composables/useTetrisSession'

const emit = defineEmits<{ press: [action: GameAction]; release: [action: GameAction] }>()

const held = new Set<GameAction>()

const press = (action: GameAction, event: PointerEvent) => {
  const button = event.currentTarget as HTMLElement
  button.setPointerCapture(event.pointerId)
  held.add(action)
  emit('press', action)
}

const release = (action: GameAction) => {
  if (!held.delete(action)) return
  emit('release', action)
}

const DPAD: { action: GameAction; label: string; area: string; symbol: string }[] = [
  { action: 'hardDrop', label: 'Chute instantanée', area: 'up', symbol: '⤓' },
  { action: 'left', label: 'Gauche', area: 'left', symbol: '◀' },
  { action: 'right', label: 'Droite', area: 'right', symbol: '▶' },
  { action: 'softDrop', label: 'Descente rapide', area: 'down', symbol: '▼' },
]

const ROTATIONS: { action: GameAction; label: string; letter: string }[] = [
  { action: 'rotateCounterClockwise', label: 'Rotation anti-horaire', letter: 'B' },
  { action: 'rotateClockwise', label: 'Rotation horaire', letter: 'A' },
]
</script>

<template>
  <div class="touch-controls" @contextmenu.prevent>
    <div class="dpad">
      <button
        v-for="button in DPAD"
        :key="button.action"
        type="button"
        class="pad-button dpad__button"
        :style="{ gridArea: button.area }"
        :aria-label="button.label"
        @pointerdown.prevent="press(button.action, $event)"
        @pointerup="release(button.action)"
        @pointercancel="release(button.action)"
        @lostpointercapture="release(button.action)"
      >
        {{ button.symbol }}
      </button>
    </div>

    <div class="rotations">
      <button
        v-for="button in ROTATIONS"
        :key="button.action"
        type="button"
        class="pad-button rotations__button"
        :class="`rotations__button--${button.letter.toLowerCase()}`"
        :aria-label="button.label"
        @pointerdown.prevent="press(button.action, $event)"
        @pointerup="release(button.action)"
        @pointercancel="release(button.action)"
        @lostpointercapture="release(button.action)"
      >
        {{ button.letter }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.touch-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 8px 4px calc(8px + env(safe-area-inset-bottom));
  touch-action: none;
}

.pad-button {
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow);
  touch-action: none;
  -webkit-touch-callout: none;
  transition:
    transform 60ms ease,
    background 60ms ease;
}

.pad-button:active {
  transform: scale(0.94);
  background: var(--surface-raised);
}

.dpad {
  display: grid;
  grid-template-areas:
    '. up .'
    'left . right'
    '. down .';
  grid-template-columns: repeat(3, 52px);
  grid-template-rows: repeat(3, 48px);
  gap: 4px;
}

.dpad__button {
  border-radius: 12px;
  font-size: 1.2rem;
}

.rotations {
  display: flex;
  gap: 14px;
  align-items: center;
}

.rotations__button {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  font-size: 1.3rem;
  font-weight: 800;
}

.rotations__button--a {
  margin-bottom: 36px;
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-text);
}

@media (hover: hover) and (pointer: fine) {
  .touch-controls {
    display: none;
  }
}
</style>
