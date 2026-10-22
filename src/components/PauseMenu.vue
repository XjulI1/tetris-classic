<script setup lang="ts">
import { vAutofocus } from '../directives/autofocus'
import BoardOverlay from './BoardOverlay.vue'

const emit = defineEmits<{ resume: []; quit: [] }>()
</script>

<template>
  <BoardOverlay title="Pause">
    <button type="button" class="button button--primary" v-autofocus @click="emit('resume')">Reprendre</button>
    <button type="button" class="button" @click="emit('quit')">Abandonner</button>
  </BoardOverlay>
</template>
