<script setup lang="ts">
import { computed } from 'vue'
import { isStepCompleted } from '@/stores/addResource'
import type { AddResourceStepCode } from '@/types/add-resource-draft'

const props = defineProps<{
  steps: { path: string; code: string; label: string }[]
  currentStep?: string
}>()

const currentStep = computed(() => {
  return props.currentStep || props.steps[0]?.code
})

function stepIsCompleted(code: string) {
  return isStepCompleted(code as AddResourceStepCode)
}

function isStepActive(code: string) {
  return currentStep.value === code
}
function arePreviousStepsCompleted(code: string) {
  const currentIndex = props.steps.findIndex(step => step.code === code)
  if (currentIndex <= 0) return true

  for (let i = 0; i < currentIndex; i++) {
    if (!stepIsCompleted(props.steps[i].code)) {
      return false
    }
  }
  return true
}
</script>

<template>
  <ul class="c-wizard">
    <li v-for="(step, index) in steps" :key="step.code" class="c-wizard__step" :class="{ 'is-active': isStepActive(step.code), 'is-done': stepIsCompleted(step.code), 'is-disabled': !arePreviousStepsCompleted(step.code) || step.path === '#' }">
      <a :href="step.path" class="c-wizard__step-link">
        <span class="c-wizard__step-number" :id="`step-${step.code}`">{{ index + 1 }}</span>
        <span class="c-wizard__step-label">{{ step.label }}</span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.c-wizard {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--wa-space-xs);
  list-style: none;
  padding: 0;
  margin: 0;
  justify-content: center;
}
.c-wizard__step {
  position: relative;
  width: 12rem;
  &:not(:last-child):after {
    content: '';
    position: absolute;
    top: 2rem;
    right: -5px;
    transform: translateX(50%);
    display: block;
    width: 6rem;
    height: 1px;
    background-color: var(--wa-color-neutral-60);
  }
  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  &.is-active {
    .c-wizard__step-number {
      border-style: solid;
      background-color: var(--wa-color-brand-50);
      color: var(--wa-color-neutral-90);
    }
  }
  &.is-done {
    .c-wizard__step-number {
      border-style: solid;
      color: var(--wa-color-neutral-90);
    }
  }
}
.c-wizard__step-link {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--wa-space-xs);
  text-decoration: none;
}
.c-wizard__step-number {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--wa-space-xs);
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: var(--wa-color-neutral-20);
  border: 2px dashed var(--wa-color-brand-50);
  color: var(--wa-color-neutral-70);
  font-weight: var(--wa-font-weight-bold);
}
.c-wizard__step-label {
  font-size: var(--wa-font-size-xs);
  color: var(--wa-color-neutral-80);
}
</style>
