<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import '@webawesome/checkbox/checkbox.js'
import { onMounted, reactive } from 'vue'
import { Map, TileLayer, LayerGroup, Marker, DivIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const days = [
  { label: 'Segunda', value: 'monday' },
  { label: 'Terça', value: 'tuesday' },
  { label: 'Quarta', value: 'wednesday' },
  { label: 'Quinta', value: 'thursday' },
  { label: 'Sexta', value: 'friday' },
  { label: 'Sábado', value: 'saturday' },
  { label: 'Domingo', value: 'sunday' },
]

type OpeningDaysType = (typeof openingDays)[keyof typeof openingDays]
type OpeningHoursType = {
  [key in OpeningDaysType['value']]: {
    start: string
    end: string
  }
}

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
  const location = JSON.parse(window.localStorage.getItem('circulab:add:location') || '{}')
  form.address = location.address || null
  form.postal_code = location.postal_code || null
  form.latitude = location.latitude || null
  form.longitude = location.longitude || null
}
function initMap() {
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
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  form[target.name as keyof typeof form] = target.value as never
  saveOnLocalStorage()
}
function handleChangeDay(event: Event) {
  const target = event.target as HTMLInputElement
  openingDays[target.name as keyof typeof openingDays] = target.checked as never
  saveOnLocalStorage()
}
const handleAddNetwork = () => {
  console.log('add network')
}
function saveOnLocalStorage() {
  const data = {
    address: form.address,
    postal_code: form.postal_code,
    latitude: form.latitude,
    longitude: form.longitude
  }
  window.localStorage.setItem('circulab:add:location', JSON.stringify(data))
}

function handleBack() {
  window.location.href = '/dashboard/adicionar/descricao'
}

function handleSubmit(event: Event) {
  const isCompleted = form.address && form.postal_code && form.latitude && form.longitude
  window.localStorage.setItem('circulab:add:location:completed', isCompleted ? 'true' : 'false')
  saveOnLocalStorage()
  if (!isCompleted) {
    event.preventDefault()
  }
}


</script>

<template>  
  <form
    @submit.prevent="handleSubmit"
    action="/dashboard/adicionar/descricao"
    method="post"
    data-astro-reload
  >
    <Grid gap="xl" direction="column">
      <div id="map"></div>
      <fieldset>
        <legend appearance="h2">Coordenadas</legend>
        <Grid fullWidth>
          <wa-input name="latitude" type="number" label="Latitude" required @input="handleInput" hint="Formato: 12.345678" :value="form.latitude"></wa-input>
          <wa-input name="longitude" type="number" label="Longitude" required @input="handleInput" hint="Formato: -12.345678" :value="form.longitude"></wa-input>
        </Grid>
      </fieldset>
      <wa-input name="address" label="Morada" required @input="handleInput" :value="form.address"></wa-input>
      <wa-input name="postal_code" required label="Código postal" pattern="^(\d{4})-(\d{3})$" hint="Formato: 1234-567" @change="handleInput" :value="form.postal_code"></wa-input>

      <h3>Horários</h3>
      <fieldset>
        <Grid direction="column">
          <legend>Dias da semana</legend>
          <Grid wrap justify="start" direction="column">
            <Grid direction="column" v-for="day in days" :key="day.value">
              <wa-checkbox :name="day.value" @change="handleChangeDay" :checked="openingDays[day.value as keyof typeof openingDays]">{{ day.label }}</wa-checkbox>
              <Grid v-if="openingDays[day.value as keyof typeof openingDays]">
                <wa-input type="time" :id="`opening_hours_start_${day.value}`" :name="`opening_hours_start_${day.value}`" label="Início" @input="handleInput" />
                <wa-input type="time" :id="`opening_hours_end_${day.value}`" :name="`opening_hours_end_${day.value}`" label="Fim" @input="handleInput" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </fieldset>
      <h3>Contactos</h3>
      <wa-input name="email" type="email" label="Email" :value="form.email" @input="handleInput"></wa-input>
      <wa-input name="phone" type="tel" label="Telefone" :value="form.phone" @input="handleInput"></wa-input>
      <h3>Canais</h3>
      <wa-input name="website" type="url" label="Website" :value="form.website" @input="handleInput"></wa-input>
      <wa-input name="instagram" type="url" label="Instagram" :value="form.instagram" @input="handleInput"></wa-input>
      <wa-input name="facebook" type="url" label="Facebook" :value="form.facebook" @input="handleInput"></wa-input>
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