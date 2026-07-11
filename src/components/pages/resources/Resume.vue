<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import { ref, onMounted } from 'vue'
import { actions } from 'astro:actions'
import type { Resource } from '@/types/domain/resource'
import { clearAddResourceDraft, getAddResourcePayload } from '@/stores/addResource'

const resumeData = ref<Resource | null>(null)

onMounted(() => {
  resumeData.value = getAddResourcePayload() as Resource
})

async function handleSubmit() {
  const { error } = await actions.addResource({
    title: resumeData.value?.title || '',
    description: resumeData.value?.description || '',
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
    phone: resumeData.value?.phone || undefined,
    phone_area_code: resumeData.value?.phone_area_code || undefined,
  })

  if (error) {
    console.error(error)
  } else {
    clearAddResourceDraft()
    window.location.href = '/'
  }
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
    <li>Coordenadas:{{ resumeData?.coordinates.latitude }}, {{ resumeData?.coordinates.longitude }}</li>
    <li>Morada:{{ resumeData?.address }}</li>
    <li>Código postal:{{ resumeData?.postal_code }}</li>
    <li>Email:{{ resumeData?.email }}</li>
    <li>Telefone: {{ resumeData?.phone_area_code ? `+${resumeData?.phone_area_code}` : '' }} {{ resumeData?.phone }}</li>
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
