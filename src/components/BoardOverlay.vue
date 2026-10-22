<script setup lang="ts">
withDefaults(defineProps<{ title: string; align?: 'center' | 'top' }>(), { align: 'center' })
</script>

<template>
  <div class="overlay">
    <div class="overlay__content" :class="`overlay__content--${align}`">
      <h2 class="overlay__title">{{ title }}</h2>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  background: var(--overlay);
  backdrop-filter: blur(6px);
  overflow-y: auto;
  user-select: text;
}

.overlay__content {
  width: 100%;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overlay__content--center {
  margin: auto;
}

.overlay__content--top {
  margin: 0 auto auto;
}

.overlay__title {
  margin: 0;
  text-align: center;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}
</style>
