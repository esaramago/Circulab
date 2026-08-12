<template>
  <wa-icon v-bind="$attrs" :style="styles"></wa-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  size?: 'xs' | 's' | 'm' | 'l' | 'xl'
  color?: string
}>()

const styles = computed(() => {
  const styles: Record<string, string> = {} 

  if (props.size) styles.fontSize = getSizeStyle(props.size)
  if (props.color) styles.color = getColorStyle(props.color)

  return styles
})

function getSizeStyle(size: string) {
  return `var(--wa-font-size-${size})`
}
function getColorStyle(color: string) {
  return `var(--wa-color-${color})`
}
</script>