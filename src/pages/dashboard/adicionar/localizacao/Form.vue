<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import { onMounted } from 'vue'
import { Map, TileLayer, LayerGroup, Marker, DivIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const handleSubmit = (event: Event) => {
  const formData = (event.target as HTMLFormElement).formData
  window.dispatchEvent(new CustomEvent('submit-form', {detail: formData}))
}
const handleBack = () => {
  window.dispatchEvent(new CustomEvent('back'))
}


onMounted(() => {
  const map = new Map('map', {
    center: [38.74, -9.14], // Lisboa coordinates
    zoom: 14,
  })
  new TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxNativeZoom: 19,
    maxZoom: 22,
  }).addTo(map)
})

const handleAddNetwork = () => {
  console.log('add network')
}
</script>

<template>  
  <form @submit.prevent="handleSubmit">
    <Grid gap="xl" direction="column">
      <div id="map"></div>
      <wa-input name="address" label="Morada" required />
      <wa-input name="postal_code" label="Código postal" required />
      <Grid fullWidth>
        <wa-input name="latitude" label="Latitude" required />
        <wa-input name="longitude" label="Longitude" required />
      </Grid>
      <h3>Contactos</h3>
      <wa-input name="email" label="Email" />
      <wa-input name="phone" label="Telefone" />
      <h3>Canais</h3>
      <wa-input name="website" label="Website" />
      <wa-input name="instagram" label="Instagram" />
      <wa-input name="facebook" label="Facebook" />
      <wa-button variant="primary" appearance="outlined" @click="handleAddNetwork">Adicionar canal</wa-button>
      <Grid justify="end" gap="xs">
        <wa-button variant="primary" appearance="outlined" @click="handleBack">Voltar</wa-button>
        <wa-button variant="primary" type="submit">Continuar</wa-button>
      </Grid>
    </Grid>
  </form>
</template>

<style scoped>
#map {
  width: 100%;
  height: 400px;
}
</style>