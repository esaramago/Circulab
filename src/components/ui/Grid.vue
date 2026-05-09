<template>
  <div class="l-grid" :style="gridStyle">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { Spacing } from '@/types/grid'

const props = defineProps<{
  gap?: Spacing
  align?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  wrap?: 'nowrap' | 'wrap'
  direction?: 'row' | 'column'
}>()

const gridStyle = computed<CSSProperties>(() => {
  const style: Record<string, string> = {}
  if (props.gap) style['--gap'] = `var(--wa-space-${props.gap})`
  if (props.align) style['--align'] = props.align
  if (props.justify) style['--justify'] = props.justify
  if (props.wrap) style['--wrap'] = props.wrap
  if (props.direction) style['--direction'] = props.direction
  return style as CSSProperties
})
</script>

<style scoped>
.l-grid {
  --gap: var(--spacing-m);
  --align: initial;
  --justify: initial;
  --wrap: initial;
  --direction: initial;
  display: flex;
  flex-direction: var(--direction);
  gap: var(--gap);
  align-items: var(--align);
  justify-content: var(--justify);
  flex-wrap: var(--wrap);
}
</style>
