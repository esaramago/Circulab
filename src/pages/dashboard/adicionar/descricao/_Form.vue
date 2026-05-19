<script setup lang="ts">
import GalleryForm from '@/components/pages/add/GalleryForm.vue'
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
  formAction: string
}>()

const form = reactive({
  name: null,
  description: null,
  typology: null as string | null,
  category: null as string | null,
  characteristics: [] as string[],
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
  form.name = description.name || null
  form.description = description.description || null
  form.typology = description.typology || null
  form.category = description.category || null
  form.characteristics = description.characteristics || []
  form.images = description.images || []

  if (description.typology) {
    setTypology(description.typology)
  }
  if (description.category) {
    setCategory(description.category)
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
    name: form.name,
    description: form.description,
    typology: form.typology,
    category: form.category,
    characteristics: form.characteristics,
    images: form.images
  }
  window.localStorage.setItem('circulab:add:description', JSON.stringify(data))
}

// #region Typology Cascade
async function setTypology(id: string) {
  form.typology = id
  form.category = null
  form.characteristics = []
  await loadCategories(id)
}

async function setCategory(id: string) {
  form.category = id
  form.characteristics = []
  await loadCharacteristics(id)
}
// #endregion

// #region Handle Events
function handleBack() {
  window.location.href = '/dashboard/adicionar/validacao'
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
    :action="formAction"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <wa-input
        name="name"
        label="Nome"
        :value="form.name"
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
        :value="form.typology"
        required
        @input="handleChange"
      >
        <template v-if="typologies && typologies.length > 0">
          <wa-option v-for="typology in typologies" :key="typology.id" :value="typology.id">{{ typology.name }}</wa-option>
        </template>
      </wa-select>
      <wa-select
        v-if="form.typology"
        name="category"
        label="Categoria"
        required
        :value="form.category"
        @input="handleChange"
      >
        <template v-if="categories.length > 0">
          <wa-option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</wa-option>
        </template>
      </wa-select>
      <wa-select
        v-if="form.category"
        name="characteristics"
        label="Características"
        :value="form.characteristics"
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
