<script setup lang="ts">
const props = defineProps<{
  width?: 'xs' | 's' | 'm'
}>()
</script>

<template>
  <div class="l-container" :class="`l-container--width-${width}`">
    <slot></slot>
  </div>
</template>

<style scoped>
.l-container {
  --width: 100rem;
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-xl);
  width: 100%;
  max-width: var(--width);
  margin-inline: auto;
  padding: var(--wa-space-l) var(--wa-space-xl) var(--wa-space-xl);
  box-sizing: border-box;
}
.l-container--width-xs {
  --width: 60rem;
}
.l-container--width-s {
  --width: 80rem;
}

</style>