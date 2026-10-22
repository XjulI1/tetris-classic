<script setup lang="ts">
import { computed } from 'vue'
import type { ThemePreference } from '../storage/settings'

const props = defineProps<{ muted: boolean; theme: ThemePreference; canPause: boolean; paused: boolean }>()

const emit = defineEmits<{ toggleMute: []; cycleTheme: []; togglePause: [] }>()

const THEME_LABELS: Record<ThemePreference, string> = {
  system: 'Thème : système',
  light: 'Thème : clair',
  dark: 'Thème : sombre',
}

const themeLabel = computed(() => THEME_LABELS[props.theme])
</script>

<template>
  <header class="top-bar">
    <h1 class="top-bar__title">TETRIS</h1>
    <div class="top-bar__actions">
      <button
        v-if="canPause"
        type="button"
        class="icon-button"
        :aria-label="paused ? 'Reprendre' : 'Pause'"
        :title="paused ? 'Reprendre' : 'Pause'"
        @click="emit('togglePause')"
      >
        <svg v-if="paused" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
      </button>
      <button
        type="button"
        class="icon-button"
        :aria-label="muted ? 'Activer le son' : 'Couper le son'"
        :title="muted ? 'Activer le son' : 'Couper le son'"
        @click="emit('toggleMute')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9z" />
          <path
            v-if="muted"
            d="M16 9l5 6M21 9l-5 6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            v-else
            d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <button type="button" class="icon-button" :aria-label="themeLabel" :title="themeLabel" @click="emit('cycleTheme')">
        <svg v-if="theme === 'light'" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path
            d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 0 18z" />
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2" />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
}

.top-bar__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.top-bar__actions {
  display: flex;
  gap: 6px;
}

.icon-button {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
}

.icon-button svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}
</style>
