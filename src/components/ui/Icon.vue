<template>
  <div :class="[computedClass, className]">
    <wa-icon :name="name" :style="styles"></wa-icon>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  name: string
  size?: 'xs' | 's' | 'm' | 'l' | 'xl'
  color?: string
  appearance?: 'filled'
  class?: string
}>()

const className = computed(() => props.class)

const styles = computed(() => {
  const styles: Record<string, string> = {} 

  if (props.size) styles.fontSize = getSizeStyle(props.size)
  if (props.color) styles.color = getColorStyle(props.color)

  return styles
})

const computedClass = computed(() => {
  if (props.appearance) return `appearance--${props.appearance}`
})

function getSizeStyle(size: string) {
  return `var(--wa-font-size-${size})`
}
function getColorStyle(color: string) {
  return `var(--wa-color-${color})`
}
</script>

<style scoped>
.appearance--filled {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--wa-color-brand-50);
  width: min-content;
  padding: var(--wa-space-xs);
  border-radius: var(--wa-border-radius-circle);
  aspect-ratio: 1/1;
}
</style>