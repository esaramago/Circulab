<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import { ref, onMounted } from 'vue'

const result = ref({})

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

function handleSubmit() {
  // save marker
  clearLocalStorage()
  window.location.href = '/'
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
    <li>{{ result.name }}</li>
    <li>{{ result.address }}</li>
    <li>{{ result.postal_code }}</li>
    <li>{{ result.latitude }}</li>
    <li>{{ result.longitude }}</li>
    <li>{{ result.accessibility }}</li>
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