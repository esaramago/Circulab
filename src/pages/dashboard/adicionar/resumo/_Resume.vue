<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import { ref, onMounted } from 'vue'
import type { MarkerType } from '@/types/data'
import { actions } from 'astro:actions'

const result = ref<MarkerType | null>(null)

function getLocalStorage() {
  const description = JSON.parse(
    window.localStorage.getItem('circulab:add:description') || '{}'
  )
  const location = JSON.parse(
    window.localStorage.getItem('circulab:add:location') || '{}'
  )

  const result = {
    ...description,
    ...location
  }

  return result
}

onMounted(() => {
  result.value = getLocalStorage()
})

async function handleSubmit() {
  // save marker

  const { data, error } = await actions.addMarker({
    name: result.value?.title || '',
    description: result.value?.description || '',
    images: result.value?.images || [],
    latitude: result.value?.coordinates?.latitude as number,
    longitude: result.value?.coordinates?.longitude as number,
    category: result.value?.category_id as string,
    characteristics: result.value?.characteristics_ids as string[],
    location_id: result.value?.location_id as string,
    address: result.value?.locations?.address as string,
    postal_code: result.value?.locations?.postal_code as string,
    email: result.value?.locations?.email as string,
    phone: result.value?.locations?.phone as number,
  })

  if (error) {
    debugger
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
    <li>{{ result?.name }}</li>
    <li>{{ result?.description }}</li>
    <li>{{ result?.images?.length }}</li>
    <li>{{ result?.latitude }}, {{ result?.longitude }}</li>
    <li>{{ result?.category }}</li>
    <li>{{ result?.characteristics }}</li>
    <li>{{ result?.address }}</li>
  </ul>

  <Grid justify="end">
    <wa-button
      variant="outlined"
      appearance="outlined"
      href="/dashboard/adicionar/localizacao">Voltar</wa-button
    >
    <wa-button variant="brand" @click="handleSubmit">Adicionar</wa-button>
  </Grid>
</template>
