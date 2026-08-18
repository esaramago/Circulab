<template>
  <component :is="props.tag" class="l-grid" :style="gridStyle" :class="[gridClass, { 'l-grid--full-width': fullWidth }]">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { Spacing, Break } from '@/types/ui/grid'

const props = withDefaults(defineProps<{
  tag?: keyof HTMLElementTagNameMap
  direction?: 'row' | 'column'
  align?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  gap?: Spacing
  break?: Break
  wrap?: boolean
  fullWidth?: boolean
}>(), {
  tag: 'div',
})

const gridStyle = computed<CSSProperties>(() => {
  const style: Record<string, string> = {}
  if (props.gap) style['--gap'] = `var(--wa-space-${props.gap})`
  if (props.align) style['--align'] = props.align
  if (props.justify) style['--justify'] = props.justify
  if (props.wrap) style['--wrap'] = props.wrap ? 'wrap' : 'nowrap'
  if (props.direction) style['--direction'] = props.direction
  return style as CSSProperties
})


const gridClass = computed(() => {
  const classes: string[] = []
  if (props.break) classes.push(`break--${props.break}`)
  return classes
})
</script>

<style scoped>
.l-grid {
  --gap: var(--wa-space-m);
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
.l-grid--full-width > * {
  width: 100%;
  flex: 1;
}
@media (max-width: 767px) {
  .break--mobile {
    flex-direction: column;
    flex-wrap: wrap;
  }
}
@media (max-width: 1023px) {
  .break--small {
    flex-direction: column;
    flex-wrap: wrap;
  }
}
</style>
<style>
.l-grid > [data-grow="1"] {
  flex-grow: 1;
}
</style>