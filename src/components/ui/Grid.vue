<template>
  <component :is="props.tag" class="l-grid" :style="gridStyle" :class="[{ 'display-grid': columns }]">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { Spacing } from '@/types/ui/grid'

const props = withDefaults(defineProps<{
  tag?: keyof HTMLElementTagNameMap
  direction?: 'row' | 'column'
  align?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'
  gap?: Spacing
  wrap?: boolean
  columns?: string
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
  if (props.columns) {
    style['--columns'] = getGridTemplateColumns(props.columns)
  }
  return style as CSSProperties
})

function getGridTemplateColumns(columns: string) {
  if (!columns) return ''

  let template = ''
  if (columns.search(' ') > -1) {
    // passing grid-template-columns
    template = columns
  } else {
    // passing column width (example: 40rem)
    template = `repeat(auto-fit, minmax(min(${columns}, 100%), 1fr))`
  }

  return template
}

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
.display-grid {
  --columns: 1fr;
  display: grid;
  grid-template-columns: var(--columns);
}
</style>
<style>
.l-grid > [data-grow="1"] {
  flex-grow: 1;
}
</style>