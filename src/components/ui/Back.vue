<script setup lang="ts">
import { computed } from 'vue'
import { m } from '@/paraglide/messages.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'

const props = defineProps<{
  href?: string
  text?: string
}>()

const backText = computed(() => props.text || m['common.back']())

function handleClick(event: MouseEvent) {
  if (!props.href) {
    event.preventDefault()
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }
}
</script>

<template>
  <a :href="href || '#'" class="c-back" @click="handleClick">
    <wa-icon name="arrow-left"></wa-icon>
    <span><slot>{{ backText }}</slot></span>
  </a>
</template>

<style scoped>
.c-back {
  display: inline-flex;
  align-items: center;
  gap: var(--wa-space-xs);
  font-size: var(--wa-font-size-s);
  color: var(--wa-color-neutral-600);
  text-decoration: none;
  font-weight: var(--wa-font-weight-semibold);
  transition: color 0.2s ease;
  cursor: pointer;
}

.c-back:hover {
  color: var(--wa-color-brand-50);
  text-decoration: underline;
}
</style>
