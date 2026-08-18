<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
const { title, subtitle } = defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <Grid justify="center" direction="column" align="center" gap="s" class="headline">
    <slot name="badge"></slot>
    <div>
      <h1><slot name="title">{{ title }}</slot></h1>
      <p class="subtitle"><slot name="subtitle">{{ subtitle }}</slot></p>
    </div>
  </Grid>
</template>

<style scoped>
.headline {
  text-align: center;
}
.subtitle {
  font-size: var(--wa-font-size-l);
  color: var(--wa-color-brand-70);
  max-width: 60rem;
  margin-inline: auto;
}
  
</style>