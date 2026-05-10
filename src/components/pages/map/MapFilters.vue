<template>
  <form class="c-filters">
    <h2 class="is-visually-hidden">Filtros</h2>
    <wa-input type="text" placeholder="Pesquisar" size="s" />
    <wa-select type="text" placeholder="Tipologia" size="s" />
    <wa-select type="text" placeholder="Categoria" size="s" />
  </form>
</template>

<script setup lang="ts">
import '@webawesome/input/input.js'
import '@webawesome/select/select.js'
</script>

<style scoped>
.c-filters {
  position: absolute;
  inset-inline-start: 5.5rem;
  inset-block-start: 1rem;
  z-index: 1001; /* one more than the map */
  display: flex;
  gap: var(--wa-space-s);
}
</style>