<script setup lang="ts">
import '@webawesome/input/input.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import '@webawesome/button/button.js'
import { ref, watch } from 'vue'
import { useStore } from '@nanostores/vue'
import { useTypologyCascade } from '@/composables/useTypologyCascade'
import { selectLayer, $mapFilters, setMapFilters, resetMapFilters, type MapFiltersState } from '@/stores/map'
import type { CharacteristicRow } from '@/types/database'

const props = defineProps<{
  modelValue?: MapFiltersState
  defaultTypologyCode?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: MapFiltersState): void
}>()

const storeFilters = useStore($mapFilters)

const typology = ref<string | null>(props.modelValue?.typology ?? storeFilters.value.typology)
const category = ref<string | null>(props.modelValue?.category ?? storeFilters.value.category)
const characteristics = ref<CharacteristicRow['name'][] | null>(props.modelValue?.characteristics ?? storeFilters.value.characteristics)
const search = ref<string | null>(props.modelValue?.search ?? storeFilters.value.search)

const {
  typologies,
  categories,
  loadCategories,
  loadCharacteristics,
} = useTypologyCascade()

// Sync local refs when store updates externally
watch(storeFilters, (newVal) => {
  if (typology.value !== newVal.typology) typology.value = newVal.typology
  if (category.value !== newVal.category) category.value = newVal.category
  if (characteristics.value !== newVal.characteristics) characteristics.value = newVal.characteristics
  if (search.value !== newVal.search) search.value = newVal.search
}, { deep: true })

// Watch for prop changes if passed via v-model
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    typology.value = newVal.typology
    category.value = newVal.category
    characteristics.value = newVal.characteristics
    search.value = newVal.search
  }
}, { deep: true })

// Sync local changes to store and emit update
watch([typology, category, characteristics, search], () => {
  const current: MapFiltersState = {
    typology: typology.value,
    category: category.value,
    characteristics: characteristics.value,
    search: search.value
  }
  setMapFilters(current)
  emit('update:modelValue', current)
}, { deep: true })

// Watch for defaultTypologyCode and set the typology
watch([() => props.defaultTypologyCode, typologies], ([code, list]) => {
  if (code && list && list.length > 0) {
    const matched = list.find(t => t.code === code)
    if (matched && typology.value !== matched.id) {
      setTypology(matched.id)
    }
  }
}, { immediate: true })

// Auto-select layer when typology is selected
watch([typology, () => typologies.value], ([newTypologyId, list]) => {
  if (newTypologyId && list && list.length > 0) {
    const selectedTypology = list.find(t => t.id === newTypologyId)
    if (selectedTypology) {
      if (selectedTypology.code === 'repair-map') {
        selectLayer('cartodb-positron')
      } else if (selectedTypology.code === 'organic') {
        selectLayer('voyager')
      }
    }
  }
}, { immediate: true })

async function setTypology(id: string | null) {
  const val = id || null
  typology.value = val
  category.value = null
  characteristics.value = null
  if (val) {
    await loadCategories(val)
    await loadCharacteristics(val)
  }
}

async function setCategory(id: string | null) {
  const val = id || null
  category.value = val
  characteristics.value = null
  if (val) {
    await loadCharacteristics(val)
  }
}

function clearFilters() {
  typology.value = null
  category.value = null
  characteristics.value = null
  search.value = null
  resetMapFilters()
}
</script>

<template>
  <form class="filters" @submit.prevent="">
    <h2 class="is-visually-hidden">Filtros</h2>
    <wa-input 
      type="text" 
      placeholder="Pesquisar" 
      size="s" 
      v-model="search"
    />
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
    <wa-select
      v-if="category && characteristics?.length"
      placeholder="Característica"
      size="s"
      :value="characteristics"
      @input="characteristics?.push(($event.target as HTMLSelectElement).value)"
      with-clear
    >
      <wa-option v-for="item in characteristics" :key="item.id" :value="item.id">{{ item.name }}</wa-option>
    </wa-select>
    <wa-button size="s" type="button" @click="clearFilters" v-if="typology || category || (characteristics && characteristics.length) || search">
      Limpar
    </wa-button>
  </form>
</template>

<style scoped>
.filters {
  position: absolute;
  inset-inline-start: 5.5rem;
  inset-block-start: 1rem;
  z-index: 1001; /* one more than the map */
  display: flex;
  gap: var(--wa-space-s);
}

.filters wa-input,
.filters wa-select,
.filters wa-button {
  flex-shrink: 0;
}
</style>
