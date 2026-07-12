<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import { ref, onMounted } from 'vue'
import { actions } from 'astro:actions'
import type { Resource } from '@/types/domain/resource'
import { clearAddResourceDraft, getAddResourcePayload } from '@/stores/addResource'

const resumeData = ref<ReturnType<typeof getAddResourcePayload> | null>(null)

onMounted(() => {
  resumeData.value = getAddResourcePayload()
})

async function handleSubmit() {
  const payload = resumeData.value
  if (!payload) return

  const { error } = await actions.addResource({
    title: payload.title || '',
    description: payload.description || '',
    coordinates: {
      latitude: Number(payload.coordinates?.latitude) || 0,
      longitude: Number(payload.coordinates?.longitude) || 0,
    },
    typology_id: payload.typology_id || '',
    category_id: payload.category_id || '',
    characteristics_ids: payload.characteristics_ids || [],
    location_name: payload.location_name,
    address: payload.address,
    postal_code: payload.postal_code,
    email: payload.email || undefined,
    phone: payload.phone || undefined,
    phone_area_code: payload.phone_area_code ? String(payload.phone_area_code) : undefined,
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
    <li>Título: {{ resumeData?.title }}</li>
    <li>Descrição: {{ resumeData?.description }}</li>
    <li>Imagem: {{ resumeData?.images?.length }}</li>
    <li>Tipologia: {{ resumeData?.typology_id }}</li>
    <li>Categoria: {{ resumeData?.category_id }}</li>
    <li>Características: {{ resumeData?.characteristics_ids?.join(', ') }}</li>
    <li>Localização: {{ resumeData?.location_name }}</li>
    <li>Coordenadas: {{ resumeData?.coordinates.latitude }}, {{ resumeData?.coordinates.longitude }}</li>
    <li>Morada: {{ resumeData?.address }}</li>
    <li>Código postal: {{ resumeData?.postal_code }}</li>
    <li>Email: {{ resumeData?.email }}</li>
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
