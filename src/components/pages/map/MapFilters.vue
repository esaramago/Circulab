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
import Grid from '@/components/ui/Grid.vue'
import Icon from '@/components/ui/Icon.vue'

import { CONFIG } from '@/config'

const props = defineProps<{
  modelValue?: MapFiltersState
  defaultTypologyCode?: string | null
}>()

function isUrlIcon(icon?: string | null): boolean {
  if (!icon) return false
  return icon.includes('/') || icon.endsWith('.svg') || icon.startsWith('http')
}

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

function handleTypologyClick(id: string) {
  if (typology.value === id) {
    setTypology(null)
  } else {
    setTypology(id)
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


const isOpen = ref(false)
function toggleFilters() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <form class="filters" @submit.prevent="" :class="{ 'is-open': isOpen }">
    <button type="button" @click="toggleFilters" class="filters__header">
      <Grid justify="space-between">
        <h3>Filtros <Icon name="filter" color="neutral-70" size="s"></Icon></h3>
        <Icon :name="isOpen ? 'circle-xmark' : 'circle-chevron-up'" size="xl" class="is-hidden-desktop"></Icon>
      </Grid>
    </button>
    <wa-button size="s" appearance="plain" @click="clearFilters" v-if="typology || category || (characteristics && characteristics.length) || search">
      Limpar filtros
    </wa-button>
    <wa-input 
      type="text"
      label="Pesquisar recurso"
      placeholder="Pesquisar" 
      size="s" 
      v-model="search"
    />

    <fieldset>
      <legend data-appearance="p">Tipologia</legend>
      <div class="typologies">
        <div v-for="item in typologies" :key="item.id" class="typologies__item">
          <input
            type="radio"
            name="typology"
            :value="item.id"
            :checked="typology === item.id"
            @click="handleTypologyClick(item.id)"
            :id="`typology-${item.id}`"
          />
          <label :for="`typology-${item.id}`" class="typologies__label">
            <wa-icon
              v-if="item.icon"
              :src="isUrlIcon(item.icon) ? CONFIG.images_url + 'pin-images/' + item.icon : undefined"
              :name="!isUrlIcon(item.icon) ? item.icon : undefined"
            ></wa-icon>
            {{ item.name }}
          </label>
        </div>
      </div>
    </fieldset>

    <wa-select
      v-if="typology"
      placeholder="Filtra a categoria"
      label="Categoria"
      size="s"
      :value="category"
      @input="setCategory(($event.target as HTMLSelectElement).value)"
      with-clear
    >
      <wa-option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</wa-option>
    </wa-select>
    <wa-select
      v-if="category && characteristics?.length"
      placeholder="Filtra a caraterística"
      label="Característica"
      size="s"
      :value="characteristics"
      @input="characteristics?.push(($event.target as HTMLSelectElement).value)"
      with-clear
    >
      <wa-option v-for="item in characteristics" :key="item.id" :value="item.id">{{ item.name }}</wa-option>
    </wa-select>
  </form>
</template>

<style scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-m);
  background-color: var(--wa-color-brand-30);
  border-radius: var(--wa-border-radius-l);
  padding: var(--wa-space-m);
  box-sizing: border-box;
  transition: transform .2s ease-in-out;

  @media (max-width: 768px) {
    position: fixed;
    z-index: 1002; /* map + 2 */
    width: 100%;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    inset-block-end: 0;
    box-shadow: var(--wa-shadow-l);
    transform: translateY(calc(100% - 7rem));
    &.is-open {
      transform: translateY(0);
    }
  }
}

.filters wa-input,
.filters wa-select,
.filters wa-button {
  flex-shrink: 0;
}

.filters__header {
  margin-block-end: var(--wa-space-s);
}

.typologies {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100% / 3, 9rem), 1fr));
  gap: var(--wa-space-xs);
  input {
    opacity: 0;
    position: absolute;
    width: 0;
    &:checked + .typologies__label {
      background-color: var(--wa-color-brand-70);
      color: var(--wa-color-brand-10);
    }
  }
}
.typologies__item {
  aspect-ratio: 5/4;
}
.typologies__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--wa-space-xs);
  background-color: var(--wa-color-brand-20);
  border-radius: var(--wa-border-radius-m);
  padding: var(--wa-space-s) var(--wa-space-xs);
  height: 100%;
  box-sizing: border-box;
  font-size: var(--wa-font-size-s);
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  line-height: 1;
  &:hover {
    background-color: var(--wa-color-brand-40);
  }

  wa-icon {
    font-size: var(--wa-font-size-xl)
  }
}
</style>
