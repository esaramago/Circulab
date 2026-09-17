<template>
  <div :class="['icon', computedClass, className]" :style="colorStyle">
    <wa-icon v-if="src" :src="src" :style="sizeStyle"></wa-icon>
    <wa-icon v-else :name="name" :style="sizeStyle"></wa-icon>
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
  src?: string
}>()

const className = computed(() => props.class)

const computedClass = computed(() => {
  if (props.appearance) return `appearance--${props.appearance}`
})

const sizeStyle = computed(() => {
  const size = props.size
  if (!size) return ''
  return {fontSize: `var(--wa-font-size-${size})`}
})
const colorStyle = computed(() => {
  const color = props.color
  if (!color) return ''
  const isHexColor = color.startsWith('#')
  const colorStyle = isHexColor ? color : `var(--wa-color-${color})`
  return {'--color': colorStyle}
})
</script>

<style scoped>
.icon {
  display: inline-block;
  > wa-icon {
    color: var(--color, #FFF);
  }
}
.appearance--filled {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: min-content;
  padding: var(--wa-space-xs);
  border-radius: var(--wa-border-radius-circle);
  aspect-ratio: 1/1;
  background-color: var(--color, var(--wa-color-brand-50));
  > wa-icon {
    color: #FFF;
  }
}
</style>