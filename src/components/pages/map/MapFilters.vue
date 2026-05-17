<script setup lang="ts">
import '@webawesome/input/input.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import { ref } from 'vue'
import { useTypologyCascade } from '@/composables/useTypologyCascade'

const typology = ref<string | null>(null)
const category = ref<string | null>(null)
const characteristic = ref<string | null>(null)

const {
  typologies,
  categories,
  loadCategories,
  loadCharacteristics,
} = useTypologyCascade()

async function setTypology(id: string) {
  typology.value = id
  category.value = null
  characteristic.value = null
  await loadCategories(id)
  await loadCharacteristics(id)
}

async function setCategory(id: string) {
  category.value = id
  characteristic.value = null
  await loadCharacteristics(id)
}
</script>

<template>
  <form class="c-filters">
    <h2 class="is-visually-hidden">Filtros</h2>
    <wa-input type="text" placeholder="Pesquisar" size="s" />
    <wa-select
      placeholder="Tipologia"
      size="s"
      :value="typology"
      @input="setTypology(($event.target as HTMLSelectElement).value)"
      with-clear
    >
      <wa-option v-for="item in typologies" :key="item.id" :value="item.id">{{ item.name }}</wa-option>
    </wa-select>
    <wa-select
      v-if="typology"
      placeholder="Categoria"
      size="s"
      :value="category"
      @input="setCategory(($event.target as HTMLSelectElement).value)"
      with-clear
    >
      <wa-option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</wa-option>
    </wa-select>
  </form>
</template>

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
