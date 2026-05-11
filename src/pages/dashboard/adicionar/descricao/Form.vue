<script setup lang="ts">
import GalleryForm from '@/components/pages/add/GalleryForm.vue'
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/textarea/textarea.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import { reactive } from 'vue'

const form = reactive({
  name: null,
  description: null,
  typology: null,
  category: null,
  characteristics: [],
  images: [] as { id: string; url: string; alt: string }[],
})

const handleSubmit = () => {
  window.dispatchEvent(new CustomEvent('submit-form', {detail: form}))
}
const handleBack = () => {
  window.dispatchEvent(new CustomEvent('back'))
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <Grid gap="xl" direction="column">
      <wa-input name="name" label="Nome" :value="form.name" required @input="form.name = $event.target.value" />
      <wa-textarea name="description" label="Descrição" :value="form.description" required @input="form.description = $event.target.value" />
      <GalleryForm client:only="vue" :images="form.images" @change="form.images = $event" />
      <wa-select name="typology" label="Tipologia" :value="form.typology" required @input="form.typology = $event.target.value">
        <wa-option value="1">1</wa-option>
        <wa-option value="2">2</wa-option>
        <wa-option value="3">3</wa-option>
      </wa-select>
      <wa-select v-if="form.typology" name="category" label="Categoria" required :value="form.category" @input="form.category = $event.target.value">
        <wa-option value="1">1</wa-option>
        <wa-option value="2">2</wa-option>
        <wa-option value="3">3</wa-option>
      </wa-select>
      <wa-select v-if="form.category" name="characteristics" label="Características" :value="form.characteristics" @input="form.characteristics = $event.target.value">
        <wa-option value="1">1</wa-option>
        <wa-option value="2">2</wa-option>
        <wa-option value="3">3</wa-option>
      </wa-select>
      <Grid justify="end" gap="s">
        <wa-button variant="brand" appearance="outlined" @click="handleBack">Voltar</wa-button>
        <wa-button variant="brand" type="submit">Continuar</wa-button>
      </Grid>
    </Grid>
  </form>
</template>