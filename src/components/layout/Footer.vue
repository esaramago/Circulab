<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
</script>

<template>
  <footer>
    <Grid gap="s" align="center">
      <p>&copy; {{new Date().getFullYear()}} Circulab</p>
    </Grid>
  </footer>
</template>

<style scoped>
footer {
  padding: var(--wa-space-m) var(--wa-space-l);
  border-block-start: 1px solid var(--wa-color-neutral-100);
  background-color: var(--wa-color-neutral-10);
}
</style>