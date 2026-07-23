<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import '@webawesome/checkbox/checkbox.js'
import '@webawesome/radio/radio.js'
import '@webawesome/radio-group/radio-group.js'
import { onMounted, ref, computed } from 'vue'
import { useStore } from '@nanostores/vue'
import { Map as LeafletMap, Marker as LeafletMarker, TileLayer } from 'leaflet'
import type { Map as LeafletMapType, Marker as LeafletMarkerType } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { $locationDraft, $descriptionDraft, setStepCompleted } from '@/stores/addResource'
import type { LocationDraft } from '@/types/add-resource-draft'
import { fetchDB } from '@/utils/fetchDB'
import { guessCoordinates, guessAdress } from '@/utils/nominatim'

let mapInstance: LeafletMapType | null = null
let markerInstance: LeafletMarkerType | null = null

const postCodeRegex = /^\d{4}-\d{3}$/

const isAdressValid = ref(false)
const isAdressInvalid = ref(false)
const typologyCode = ref<string>('')
const draft = useStore($locationDraft)

const isTypologyRepairMap = computed(() => {
  return typologyCode.value === 'repair-map'
})

const hasCoordinates = computed(() => {
  return draft.value.coordinates && !!draft.value.coordinates.latitude && !!draft.value.coordinates.longitude
})

onMounted(async () => {
  initMap()
  typologyCode.value = await getTypologyCode() || ''
})

async function getTypologyCode() {
  const typologyId = $descriptionDraft.get().typology_id
  if (typologyId) {
    const {data: typology} = await fetchDB('typologies').select('code').eq('id', typologyId).single()
    return typology?.code
  }
  return null
}
function updateDraft(partial: Partial<LocationDraft>) {
  $locationDraft.set({
    ...draft.value,
    ...partial,
  } as LocationDraft)
}

function updateMarker(lat: number, lng: number) {
  if (mapInstance && markerInstance) {
    const currentLatLng = markerInstance.getLatLng()
    if (currentLatLng.lat !== lat || currentLatLng.lng !== lng) {
      markerInstance.setLatLng([lat, lng])
      mapInstance.setView([lat, lng])
    }
  }
}

function initMap() {
  const storeValue = $locationDraft.get()
  let initialLat = storeValue.coordinates?.latitude
  let initialLng = storeValue.coordinates?.longitude

  // Se for o valor inicial (0,0), use coordenadas padrão de Lisboa
  if (!initialLat || !initialLng) {
    initialLat = 38.74
    initialLng = -9.14
  }

  mapInstance = new LeafletMap('map', {
    center: [initialLat, initialLng],
    zoom: 14,
  })
  new TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxNativeZoom: 19,
    maxZoom: 22,
  }).addTo(mapInstance)

  markerInstance = new LeafletMarker([initialLat, initialLng], { draggable: true }).addTo(mapInstance)
  updateMarker(initialLat, initialLng)

  markerInstance.on('dragend', () => {
    const position = markerInstance?.getLatLng()
    if (position) {
      const latitude = Number(position.lat.toFixed(6))
      const longitude = Number(position.lng.toFixed(6))
      updateDraft({ coordinates: { latitude, longitude } })
      updateAddress(latitude, longitude)
      updateMarker(latitude, longitude)
    }
  })

  mapInstance.on('click', (e: { latlng: { lat: number, lng: number } }) => {
    const latitude = Number(e.latlng.lat.toFixed(6))
    const longitude = Number(e.latlng.lng.toFixed(6))
    updateDraft({ coordinates: { latitude, longitude } })
    updateAddress(latitude, longitude)
    updateMarker(latitude, longitude)
  })
}

async function updateAddress(latitude: number, longitude: number) {
  const address = await guessAdress(latitude, longitude)
  if (address) {
    isAdressValid.value = true
    isAdressInvalid.value = false
    updateDraft({
      address: address.address,
      postal_code: address.postal_code,
    })
  }
}

function handleInput(event: Event) {
  const field = event.target as HTMLInputElement & { checkValidity?: () => boolean }
  const name = field.name
  const key = name as keyof LocationDraft

  if (name === 'address') {
    isAdressValid.value = false
    isAdressInvalid.value = false
  }

  if (name === 'latitude' || name === 'longitude') {
    const numValue = field.value === '' ? draft.value.coordinates[name as 'latitude' | 'longitude'] : Number(field.value)
    const newCoords = { ...draft.value.coordinates, [name as 'latitude' | 'longitude']: numValue }
    updateDraft({ coordinates: newCoords })
    updateMarker(newCoords?.latitude, newCoords?.longitude)
    return
  }


  if (name === 'accessibility') {
    updateDraft({ [key]: field.value as LocationDraft['accessibility'] })
    return
  }

  if (!field.value) {
    updateDraft({ [key]: '' })
    return
  }

  if (field.checkValidity && !field.checkValidity()) return

  updateDraft({ [key]: field.value } as Partial<LocationDraft>)
}

async function handleChange(event: Event) {

  const field = event.target as HTMLInputElement
  const name = field.name as keyof LocationDraft

  if (name !== 'address' && name !== 'postal_code') return
  if (!field.checkValidity()) return

  if (name === 'postal_code') {
    updateDraft({ postal_code: field.value })
  }

  const address = (name === 'address' ? field.value : draft.value.address)?.trim()
  const postal_code = (name === 'postal_code' ? field.value : draft.value.postal_code)?.trim()
  if (!address) return

  const coordinates = await guessCoordinates(address, postal_code)
  if (coordinates) {
    updateDraft({
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }
    })
    updateMarker(coordinates.latitude, coordinates.longitude)
  } else {
    updateDraft({
      coordinates: {
        latitude: 0,
        longitude: 0,
      }
    })
  }

  if (draft.value.address && postCodeRegex.test(draft.value.postal_code) && !hasCoordinates.value) {
    isAdressValid.value = false
    isAdressInvalid.value = true
  }
}

function handleBack() {
  window.location.href = '/recursos/novo/descricao'
}

function handleSubmit(event: Event) {
  const isCompleted = (event.target as HTMLFormElement).checkValidity() && hasCoordinates.value
  setStepCompleted('location', isCompleted)
  if (!isCompleted) {
    event.preventDefault()
    if (!hasCoordinates.value) {
      isAdressValid.value = false
      isAdressInvalid.value = true
    }
  }
}
</script>

<template>
  <form
    action="/recursos/novo/contactos"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <Grid gap="xs" direction="column">
        <div id="map"></div>
        <p class="u-text-small">
          Coordenadas:
          <template v-if="hasCoordinates"><span class="u-font-monospace">{{ draft.coordinates?.latitude }}</span>, <span class="u-font-monospace">{{ draft.coordinates?.longitude }}</span></template>
          <template v-else>Sem coordenadas</template>
        </p>
      </Grid>
      <input name="latitude" label="Latitude" type="hidden" required :value="draft.coordinates?.latitude">
      <input name="longitude" label="Longitude" type="hidden" required :value="draft.coordinates?.longitude">
      <Grid direction="column" gap="xs">
        <wa-input name="address" label="Morada" required @input="handleInput" @change="handleChange" :value="draft.address"></wa-input>
        <p v-if="isAdressInvalid" class="u-text-error">Morada não encontrada. Por favor, verifique se o endereço está correto.</p>
        <p v-else-if="isAdressValid" class="u-text-success">Morada válida</p>
      </Grid>
      <wa-input name="postal_code" required label="Código postal" :pattern="postCodeRegex.source" hint="Formato: 1234-567" @change="handleChange" :value="draft.postal_code"></wa-input>
      
      <wa-input v-if="!isTypologyRepairMap" name="location_name" label="Nome do local" hint="Preencha apenas se o recurso estiver dentro de um local específico" @input="handleInput" :value="draft.location_name"></wa-input>

      <wa-radio-group label="Acessibilidade" name="accessibility" @change="handleInput" required :value="draft.accessibility">
        <wa-radio value="public">Local com acesso livre</wa-radio>
        <wa-radio value="private">Local com acesso limitado</wa-radio>
      </wa-radio-group>

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
