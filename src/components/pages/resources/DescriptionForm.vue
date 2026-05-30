<script setup lang="ts">
import GalleryForm from '@/components/pages/resources/GalleryForm.vue'
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/textarea/textarea.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import { reactive, onMounted } from 'vue'
import type { Database } from '@/types/supabase'
import { useTypologyCascade } from '@/composables/useTypologyCascade'

type typologiesType = Database['public']['Tables']['typologies']['Row'][]

defineProps<{
  typologies: typologiesType | null
}>()

const form = reactive({
  title: null,
  description: null,
  typology_id: null as string | null,
  category_id: null as string | null,
  characteristics_ids: [] as string[],
  images: [] as { id: string; url: string; alt: string }[],
})

const {
  categories,
  characteristics,
  loadCategories,
  loadCharacteristics,
} = useTypologyCascade()

onMounted(() => {
  const description = JSON.parse(window.localStorage.getItem('circulab:add:description') || '{}')
  form.title = description.title || null
  form.description = description.description || null
  form.typology_id = description.typology_id || null
  form.category_id = description.category_id || null
  form.characteristics_ids = description.characteristics_ids || []
  form.images = description.images || []

  if (description.typology_id) {
    setTypology(description.typology_id)
  }
  if (description.category_id) {
    setCategory(description.category_id)
  }
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  form[target.name as keyof typeof form] = target.value as never
  saveOnLocalStorage()
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  form[target.name as keyof typeof form] = target.value as never
  if (target.name === 'typology') {
    setTypology(target.value)
  } else if (target.name === 'category') {
    setCategory(target.value)
  }
  saveOnLocalStorage()
}

function saveOnLocalStorage() {
  const data = {
    title: form.title,
    description: form.description,
    typology_id: form.typology_id,
    category_id: form.category_id,
    characteristics_ids: form.characteristics_ids,
    images: form.images
  }
  window.localStorage.setItem('circulab:add:description', JSON.stringify(data))
}

// #region Typology Cascade
async function setTypology(id: string) {
  form.typology_id = id
  form.category_id = null
  form.characteristics_ids = []
  await loadCategories(id)
}

async function setCategory(id: string) {
  form.category_id = id
  form.characteristics_ids = []
  await loadCharacteristics(id)
}
// #endregion

// #region Handle Events
function handleBack() {
  window.location.href = '/recursos/novo'
}

function handleSubmit(event: Event) {
  const isCompleted = (event.target as HTMLFormElement).checkValidity()
  if (isCompleted) {
    window.localStorage.setItem('circulab:add:description:completed', 'true')
  } else {
    window.localStorage.removeItem('circulab:add:description:completed')
    event.preventDefault()
  }
}
// #endregion
</script>

<template>
  <form
    action="/recursos/novo/localizacao"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <wa-input
        name="title"
        label="Título"
        :value="form.title"
        required
        @input="handleInput"
      />
      <wa-textarea
        name="description"
        label="Descrição"
        :value="form.description"
        required
        @input="handleInput"
      />
      <GalleryForm client:only="vue" :images="form.images" @change="form.images = $event" />
      <wa-select
        name="typology"
        label="Tipologia"
        :value="form.typology_id"
        required
        @input="handleChange"
      >
        <template v-if="typologies && typologies.length > 0">
          <wa-option v-for="typology in typologies" :key="typology.id" :value="typology.id">{{ typology.name }}</wa-option>
        </template>
      </wa-select>
      <wa-select
        v-if="form.typology_id"
        name="category"
        label="Categoria"
        required
        :value="form.category_id"
        @input="handleChange"
      >
        <template v-if="categories.length > 0">
          <wa-option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</wa-option>
        </template>
      </wa-select>
      <wa-select
        v-if="form.category_id"
        name="characteristics"
        label="Características"
        :value="form.characteristics_ids"
        @input="handleChange"
      >
        <template v-if="characteristics.length > 0">
          <wa-option v-for="characteristic in characteristics" :key="characteristic.id" :value="characteristic.id">{{ characteristic.name }}</wa-option>
        </template>
      </wa-select>
      <Grid justify="end" gap="s">
        <wa-button variant="brand" appearance="outlined" @click="handleBack">Voltar</wa-button>
        <wa-button variant="brand" type="submit">Continuar</wa-button>
      </Grid>
    </Grid>
  </form>
</template>
