<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import '@webawesome/checkbox/checkbox.js'
import '@webawesome/radio/radio.js'
import '@webawesome/radio-group/radio-group.js'
import { onMounted, reactive, watch, ref } from 'vue'
import { Map, TileLayer, LayerGroup, Marker, DivIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { weekdays } from '@/config'

let mapInstance: Map | null = null
let markerInstance: Marker | null = null

type OpeningDaysType = (typeof weekdays)[keyof typeof weekdays]
type OpeningHoursType = {
  [key in OpeningDaysType['value']]: {
    start: string
    end: string
  }
}

const insideSpace = ref(false)
const openingDays = reactive({
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: false,
})
const form = reactive({
  address: '' as string,
  postal_code: '' as string,
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  accessibility: '' as 'public' | 'private',
  opening_days: [] as string[],
  opening_hours: {} as OpeningHoursType,
  email: '' as string,
  phone: undefined as number | undefined,
  website: '' as string,
  instagram: '' as string,
  facebook: '' as string,
  networks: [] as string[],
})

onMounted(() => {
  getLocalStorage()
  initMap()
})
function getLocalStorage() {
  const locationForm = JSON.parse(window.localStorage.getItem('circulab:add:location') || '{}')
  Object.assign(form, locationForm)
}
function initMap() {
  const initialLat = form.latitude || 38.74
  const initialLng = form.longitude || -9.14

  mapInstance = new Map('map', {
    center: [initialLat, initialLng],
    zoom: 14,
  })
  new TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxNativeZoom: 19,
    maxZoom: 22,
  }).addTo(mapInstance)

  markerInstance = new Marker([initialLat, initialLng], { draggable: true }).addTo(mapInstance)

  markerInstance.on('dragend', () => {
    const position = markerInstance!.getLatLng()
    form.latitude = Number(position.lat.toFixed(6))
    form.longitude = Number(position.lng.toFixed(6))
    saveOnLocalStorage()
    fetchAddress(form.latitude, form.longitude)
  })

  mapInstance.on('click', (e: any) => {
    markerInstance!.setLatLng(e.latlng)
    form.latitude = Number(e.latlng.lat.toFixed(6))
    form.longitude = Number(e.latlng.lng.toFixed(6))
    saveOnLocalStorage()
    fetchAddress(form.latitude, form.longitude)
  })
}

async function fetchAddress(lat: number, lng: number) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    const data = await response.json()
    if (data && data.address) {
      const road = data.address.road || data.address.pedestrian || ''
      const houseNumber = data.address.house_number || ''
      let address = road
      if (houseNumber) {
        address += `, ${houseNumber}`
      }
      if (!address) {
        address = data.display_name.split(',')[0]
      }
      form.address = address
      form.postal_code = data.address.postcode || ''
      saveOnLocalStorage()
    }
  } catch (error) {
    console.error('Erro a obter a morada:', error)
  }
}

watch(() => [form.latitude, form.longitude], ([lat, lng]) => {
  // Update marker position and zoom when coordinates change
  if (mapInstance && markerInstance) {
    let numLat = Number(lat)
    let numLng = Number(lng)

    if (typeof lat === 'string' && (lat as string).includes(',')) numLat = Number((lat as string).replace(',', '.'))
    if (typeof lng === 'string' && (lng as string).includes(',')) numLng = Number((lng as string).replace(',', '.'))

    if (!isNaN(numLat) && !isNaN(numLng) && numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180) {
      const currentLatLng = markerInstance.getLatLng()
      if (currentLatLng.lat !== numLat || currentLatLng.lng !== numLng) {
        markerInstance.setLatLng([numLat, numLng])
        mapInstance.setView([numLat, numLng])
      }
    }
  }
})

function handleInput(event: Event) {
  const field = event.target as HTMLInputElement
  form[field.name as keyof typeof form] = field.value as never
  const isFieldValid = field.checkValidity()
  if (isFieldValid) {
    saveOnLocalStorage()
  }
}

/*
function handleChangeDay(event: Event) {
  const target = event.target as HTMLInputElement
  openingDays[target.name as keyof typeof openingDays] = target.checked as never
  saveOnLocalStorage()
}*/
const handleAddNetwork = () => {
  console.log('add network')
}
function saveOnLocalStorage() {
  window.localStorage.setItem('circulab:add:location', JSON.stringify(form))
}

function handleBack() {
  window.location.href = '/dashboard/adicionar/descricao'
}

function handleSubmit(event: Event) {
  const isCompleted = (event.target as HTMLFormElement).checkValidity()
  if (isCompleted) {
    window.localStorage.setItem('circulab:add:location:completed', 'true')
  } else {
    window.localStorage.removeItem('circulab:add:location:completed')
    event.preventDefault()
  }
}
</script>

<template>  
  <form
    action="/dashboard/adicionar/resumo"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <div id="map"></div>
      <fieldset>
        <legend appearance="h2">Coordenadas</legend>
        <Grid fullWidth>
          <wa-input name="latitude" type="number" step="any" label="Latitude" required @input="handleInput" hint="Formato: 38,730000" :value="form.latitude"></wa-input>
          <wa-input name="longitude" type="number" step="any" label="Longitude" required @input="handleInput" hint="Formato: -9,130000" :value="form.longitude"></wa-input>
        </Grid>
      </fieldset>
      <wa-input name="address" label="Morada" required @input="handleInput" :value="form.address"></wa-input>
      <wa-input name="postal_code" required label="Código postal" pattern="^(\d{4})-(\d{3})$" hint="Formato: 1234-567" @change="handleInput" :value="form.postal_code"></wa-input>
      
      <wa-radio-group label="Acessibilidade" name="accessibility" @change="handleInput" required :value="form.accessibility">
        <wa-radio value="public">Acessível ao público</wa-radio>
        <wa-radio value="private">Local privado</wa-radio>
      </wa-radio-group>

      <!---
      <wa-checkbox name="inside_space" @change="insideSpace = !insideSpace">Está dentro de um espaço?</wa-checkbox>
      <wa-input v-if="insideSpace" name="space_name" label="Nome do espaço" required @input="handleInput"></wa-input>
      -->
      

      <!--<h3>Horários</h3>
      <fieldset>
        <Grid direction="column">
          <legend>Dias da semana</legend>
          <Grid wrap justify="start" direction="column">
            <Grid direction="column" v-for="day in weekdays" :key="day.value">
              <wa-checkbox :name="day.value" @change="handleChangeDay" :checked="openingDays[day.value as keyof typeof openingDays]">{{ day.label }}</wa-checkbox>
              <Grid v-if="openingDays[day.value as keyof typeof openingDays]">
                <wa-input type="time" :id="`opening_hours_start_${day.value}`" :name="`opening_hours_start_${day.value}`" label="Início" @input="handleInput" />
                <wa-input type="time" :id="`opening_hours_end_${day.value}`" :name="`opening_hours_end_${day.value}`" label="Fim" @input="handleInput" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </fieldset>-->
      <h3>Contactos</h3>
      <wa-input name="email" type="email" label="Email" :value="form.email" @input="handleInput"></wa-input>
      <wa-input name="phone" type="tel" label="Telefone" pattern="^\+?[0-9\s\-]+$" hint="Ex: +351 912345678" :value="form.phone" @input="handleInput"></wa-input>
      <h3>Canais</h3>
      <wa-input name="website" type="url" label="Website" :value="form.website" @input="handleInput"></wa-input>
      <wa-input name="instagram" type="url" label="Instagram" :value="form.instagram" @input="handleInput"></wa-input>
      <wa-input name="facebook" type="url" label="Facebook" :value="form.facebook" @input="handleInput"></wa-input>
      <!---<wa-button variant="primary" appearance="outlined" @click="handleAddNetwork">Adicionar canal</wa-button>-->
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