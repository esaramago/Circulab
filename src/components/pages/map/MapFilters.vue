<script setup lang="ts">
import '@webawesome/input/input.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import '@webawesome/button/button.js'
import { ref, watch } from 'vue'
import { useTypologyCascade } from '@/composables/useTypologyCascade'

const props = defineProps<{
  modelValue: {
    typology: string | null
    category: string | null
    characteristic: string | null
    search: string | null
  }
}>()

const emit = defineEmits(['update:modelValue'])

const typology = ref<string | null>(props.modelValue.typology)
const category = ref<string | null>(props.modelValue.category)
const characteristic = ref<string | null>(props.modelValue.characteristic)
const search = ref<string | null>(props.modelValue.search)

const {
  typologies,
  categories,
  loadCategories,
  loadCharacteristics,
} = useTypologyCascade()

// Watch for prop changes (e.g., when filters are cleared externally)
watch(() => props.modelValue, (newVal) => {
  typology.value = newVal.typology
  category.value = newVal.category
  characteristic.value = newVal.characteristic
  search.value = newVal.search
}, { deep: true })

// Watch for internal changes and emit updates
watch([typology, category, characteristic, search], () => {
  emit('update:modelValue', {
    typology: typology.value,
    category: category.value,
    characteristic: characteristic.value,
    search: search.value
  })
}, { deep: true })

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

function clearFilters() {
  typology.value = null
  category.value = null
  characteristic.value = null
  search.value = null
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
      v-if="category && characteristic?.length"
      placeholder="Característica"
      size="s"
      :value="characteristic"
      @input="characteristic = ($event.target as HTMLSelectElement).value"
      with-clear
    >
      <wa-option v-for="item in characteristic" :key="item.id" :value="item.id">{{ item.name }}</wa-option>
    </wa-select>
    <wa-button size="s" type="button" @click="clearFilters" v-if="typology || category || characteristic || search">
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
