<script setup lang="ts">
import GalleryForm from '@/components/pages/add/GalleryForm.vue'
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
})
</script>

<template>
  <wa-input name="name" label="Nome" :value="form.name" required @input="form.name = $event.target.value" />
  <wa-textarea name="description" label="Descrição" :value="form.description" required @input="form.description = $event.target.value" />
  <GalleryForm />
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
</template>