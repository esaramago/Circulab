<template>
  <h1 v-if="level === 1" :class="`c-heading--${appearance}`"><slot></slot></h1>
  <h2 v-else-if="level === 2" :class="`c-heading--${appearance}`"><slot></slot></h2>
  <h3 v-else-if="level === 3" :class="`c-heading--${appearance}`"><slot></slot></h3>
  <h4 v-else-if="level === 4" :class="`c-heading--${appearance}`"><slot></slot></h4>
  <h5 v-else-if="level === 5" :class="`c-heading--${appearance}`"><slot></slot></h5>
  <h6 v-else-if="level === 6" :class="`c-heading--${appearance}`"><slot></slot></h6>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  level?: 1 | 2 | 3 | 4 | 5 | 6
  appearance?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
}>()

const level = computed(() => props.level || 1)
const appearance = computed(() => props.appearance || 'h1')
</script>

<style scoped>
.c-heading {
  font-size: var(--wa-font-size-2xl);
  font-weight: var(--wa-font-weight-semibold);
  &--h1 {
    font-size: var(--wa-font-size-4xl);
  }
  &--h2 {
    font-size: var(--wa-font-size-3xl);
  }
  &--h3 {
    font-size: var(--wa-font-size-2xl);
  }
  &--h4 {
    font-size: var(--wa-font-size-xl);
  }
  &--h5 {
    font-size: var(--wa-font-size-l);
  }
  &--h6 {
    font-size: var(--wa-font-size-m);
  }
  &--p {
    font-size: var(--wa-font-size-m);
    font-weight: var(--wa-font-weight-normal);
  }
}
</style>