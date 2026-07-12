<script setup lang="ts">
import GalleryForm from '@/components/pages/resources/GalleryForm.vue'
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/textarea/textarea.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import { onMounted, ref } from 'vue'
import { useStore } from '@nanostores/vue'
import type { Database } from '@/types/supabase'
import { useTypologyCascade } from '@/composables/useTypologyCascade'
import { $descriptionDraft, setStepCompleted } from '@/stores/addResource'
import type { DescriptionDraft, DescriptionImageDraft } from '@/types/add-resource-draft'
import { getImage } from '@/utils/imageStore'

type typologiesType = Database['public']['Tables']['typologies']['Row'][]

defineProps<{
  typologies: typologiesType | null
}>()

const draft = useStore($descriptionDraft)
const isMounted = ref(false)

const {
  categories,
  characteristics,
  loadCategories,
  loadCharacteristics,
} = useTypologyCascade()

onMounted(async () => {
  if (draft.value.images && draft.value.images.length > 0) {
    const updatedImages: DescriptionImageDraft[] = []
    for (const img of draft.value.images) {
      const blob = await getImage(img.id)
      if (blob) {
        updatedImages.push({
          ...img,
          url: URL.createObjectURL(blob),
        })
      } else {
        updatedImages.push(img)
      }
    }
    updateDraft({ images: updatedImages })
  }

  if (draft.value.typology_id) {
    await setTypology(draft.value.typology_id)
  }
  if (draft.value.category_id) {
    await setCategory(draft.value.category_id)
  }
  isMounted.value = true
})

function updateDraft(partial: Partial<DescriptionDraft>) {
  $descriptionDraft.set({
    ...$descriptionDraft.get(),
    ...partial,
  })
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  updateDraft({ [target.name]: target.value } as Partial<DescriptionDraft>)
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  if (target.name === 'typology') {
    setTypology(target.value)
  } else if (target.name === 'category') {
    setCategory(target.value)
  } else {
    updateDraft({ [target.name]: target.value } as Partial<DescriptionDraft>)
  }
}

function handleImagesChange(images: DescriptionImageDraft[]) {
  updateDraft({ images })
}

// #region Typology Cascade
async function setTypology(id: string) {
  updateDraft({
    typology_id: id,
  })
  if (isMounted.value) {
    // clear category and characteristics if not on load
    updateDraft({
      category_id: null,
      characteristics_ids: [],
    })
  }

  await loadCategories(id)
}

async function setCategory(id: string) {
  updateDraft({
    category_id: id,
  })
  // clear characteristics if not on load
  if (isMounted.value) {
    updateDraft({
      characteristics_ids: [],
    })
  }
  await loadCharacteristics(id)
}
// #endregion

// #region Handle Events
function handleBack() {
  window.location.href = '/recursos/novo'
}

function handleSubmit(event: Event) {
  const isCompleted = (event.target as HTMLFormElement).checkValidity()
  setStepCompleted('description', isCompleted)
  if (!isCompleted) {
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
        :value="draft.title"
        required
        @input="handleInput"
      />
      <wa-textarea
        name="description"
        label="Descrição"
        :value="draft.description"
        required
        @input="handleInput"
      />
      <GalleryForm client:only="vue" :images="draft.images" @change="handleImagesChange" />
      <wa-select
        name="typology"
        label="Tipologia"
        :value="draft.typology_id"
        required
        @input="handleChange"
      >
        <template v-if="typologies && typologies.length > 0">
          <wa-option v-for="typology in typologies" :key="typology.id" :value="typology.id">{{ typology.name }}</wa-option>
        </template>
      </wa-select>
      <wa-select
        v-if="draft.typology_id"
        name="category"
        label="Categoria"
        required
        :value="draft.category_id"
        @input="handleChange"
      >
        <template v-if="categories.length > 0">
          <wa-option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</wa-option>
        </template>
      </wa-select>
      <wa-select
        v-if="draft.category_id && characteristics.length > 0"
        name="characteristics"
        label="Características"
        :value="draft.characteristics_ids"
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
