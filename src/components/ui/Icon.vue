<template>
  <wa-icon v-bind="$attrs" :style="iconSize"></wa-icon>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  size: 'xs' | 's' | 'm' | 'l' | 'xl'
}>()

const iconSize = computed(() => {
  const size = props.size || 'm'
  return `font-size: var(--wa-font-size-${size})`
})
</script>