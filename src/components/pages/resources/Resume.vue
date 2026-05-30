<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import { ref, onMounted } from 'vue'
import { actions } from 'astro:actions'
import type { ImageType } from '@/types/database'
import type { MarkerType } from '@/schemas/marker.server'

const resumeData = ref<MarkerType | null>(null)

function getLocalStorage() {
  const description = JSON.parse(
    window.localStorage.getItem('circulab:add:description') || '{}'
  )
  const location = JSON.parse(
    window.localStorage.getItem('circulab:add:location') || '{}'
  )

  return {
    ...description,
    ...location
  }
}

onMounted(() => {
  resumeData.value = getLocalStorage()
})

async function handleSubmit() {
  // save marker

  const { data, error } = await actions.addMarker({
    title: resumeData.value?.title || '',
    description: resumeData.value?.description || '',
    /* images: resumeData.value?.images?.map((image: ImageType) => ({
      bucket: image.bucket,
      path: image.path,
    })) || [], */
    coordinates: {
      latitude: Number(resumeData.value?.latitude) || 0,
      longitude: Number(resumeData.value?.longitude) || 0,
    },
    typology_id: resumeData.value?.typology_id || '',
    category_id: resumeData.value?.category_id || '',
    characteristics_ids: resumeData.value?.characteristics_ids || [],
    location_name: resumeData.value?.location_name,
    address: resumeData.value?.address,
    postal_code: resumeData.value?.postal_code,
    email: resumeData.value?.email || undefined,
    phone: resumeData.value?.phone,
  })

  if (error) {
    console.error(error)
  } else {
    clearLocalStorage()
    window.location.href = '/'
  }
}

function clearLocalStorage() {
  window.localStorage.removeItem('circulab:add:description')
  window.localStorage.removeItem('circulab:add:location')
  window.localStorage.removeItem('circulab:add:validation')
  window.localStorage.removeItem('circulab:add:location:completed')
  window.localStorage.removeItem('circulab:add:description:completed')
}
</script>

<template>
  <ul>
    <li>Título:{{ resumeData?.title }}</li>
    <li>Descrição:{{ resumeData?.description }}</li>
    <li>Imagem:{{ resumeData?.images?.length }}</li>
    <li>Tipologia:{{ resumeData?.typology_id }}</li>
    <li>Categoria:{{ resumeData?.category_id }}</li>
    <li>Características:{{ resumeData?.characteristics_ids?.join(', ') }}</li>
    <li>Localização:{{ resumeData?.location_name }}</li>
    <li>Coordenadas:{{ resumeData?.latitude }}, {{ resumeData?.longitude }}</li>
    <li>Morada:{{ resumeData?.address }}</li>
    <li>Código postal:{{ resumeData?.postal_code }}</li>
    <li>Email:{{ resumeData?.email }}</li>
    <li>Telefone:{{ resumeData?.phone }}</li>
  </ul>

  <Grid justify="end">
    <wa-button
      variant="outlined"
      appearance="outlined"
      href="/recursos/novo/localizacao">Voltar</wa-button
    >
    <wa-button variant="brand" @click="handleSubmit">Adicionar</wa-button>
  </Grid>
</template>
