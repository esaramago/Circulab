<script setup lang="ts">
import GalleryForm from '@/components/pages/add/GalleryForm.vue'
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/textarea/textarea.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import { reactive, ref } from 'vue'
import type { Database } from '@/types/supabase'
import { fetchDB } from '@/utils/fetchDB'

type typologiesType = Database['public']['Tables']['typologies']['Row'][]
type categoriesType = Database['public']['Tables']['categories']['Row'][]
type characteristicsType = Database['public']['Tables']['characteristics']['Row'][]

const props = defineProps<{
  typologies: typologiesType | null
  formAction: string
}>()

const categories = ref<categoriesType>([])
const characteristics = ref<characteristicsType>([])

const getCategories = async (typologyId: string) => {
  const { data: categories, error } = await fetchDB('categories').select('*').eq('typology_id', typologyId)
  return categories ?? []
}

const getCharacteristics = async (categoryId: string) => {
  const { data: characteristics, error } = await fetchDB('characteristics').select('*').eq('category_id', categoryId)
  return characteristics ?? []
}

const form = reactive({
  name: null,
  description: null,
  typology: null as string | null,
  category: null as string | null,
  characteristics: [] as string[],
  images: [] as { id: string; url: string; alt: string }[],
})

const onChangeTypology = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  form.typology = target.value
  form.category = null
  form.characteristics = []
  categories.value = await getCategories(form.typology)
}

const onChangeCategory = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  form.category = target.value
  form.characteristics = []
  characteristics.value = await getCharacteristics(form.category)
}

const handleSubmit = () => {
  window.localStorage.setItem('circulab:add:description', JSON.stringify(form))
}
const handleBack = () => {
  window.dispatchEvent(new CustomEvent('back'))
}
</script>

<template>
  <form
    :action="formAction"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <wa-input name="name" label="Nome" :value="form.name" required @input="form.name = $event.target.value" />
      <wa-textarea name="description" label="Descrição" :value="form.description" required @input="form.description = $event.target.value" />
      <GalleryForm client:only="vue" :images="form.images" @change="form.images = $event" />
      <wa-select
        name="typology"
        label="Tipologia"
        :value="form.typology"
        required
        @input="onChangeTypology"
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
        @input="onChangeCategory"
      >
        <template v-if="categories && categories.length > 0">
          <wa-option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</wa-option>
        </template>
      </wa-select>
      <wa-select
        v-if="form.category"
        name="characteristics"
        label="Características"
        :value="form.characteristics"
        @input="form.characteristics = $event.target.value"
      >
        <template v-if="characteristics && characteristics.length > 0">
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