<template>
  <li class="c-wizard-step" :class="{ 'is-active': isActive }">
    <span class="c-wizard-step__item" :id="`step-${step}`">{{ step }}</span>
    <wa-tooltip :for="`step-${step}`">{{ label }}</wa-tooltip>
  </li>
</template>

<script setup lang="ts">
import '@awesome.me/webawesome/dist/components/tooltip/tooltip.js'

const props = defineProps<{
  step: number
  label: string
  isActive: boolean
}>()
</script>

<style scoped>
.c-wizard-step {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--wa-space-s);
  &:after {
    content: '';
    display: block;
    width: 3rem;
    height: 2px;
    background-color: var(--wa-color-neutral-80);
  }
  &.is-active {
    .c-wizard-step__item {
      background-color: var(--wa-color-brand-50);
    }
  }
}
.c-wizard-step__item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--wa-space-s);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid var(--wa-color-neutral-80);
  cursor: default;
}
</style>