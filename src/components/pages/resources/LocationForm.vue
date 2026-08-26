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
import { $locationDraft, $descriptionDraft, $editingResourceId, setStepCompleted, ensureDraftLoaded } from '@/stores/addResource'
import { localizeHref } from '@/paraglide/runtime.js'
import type { LocationDraft } from '@/types/add-resource-draft'
import { fetchDB } from '@/utils/fetchDB'
import { guessCoordinates, guessAdress } from '@/utils/nominatim'
import { m } from '@/paraglide/messages.js'
import { MAP_LAYERS } from '@/stores/map'

const props = withDefaults(
  defineProps<{
    inModal?: boolean
  }>(),
  {
    inModal: false,
  }
)

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
}>()

let mapInstance: LeafletMapType | null = null
let markerInstance: LeafletMarkerType | null = null

const postCodeRegex = /^\d{4}-\d{3}$/

const isAdressValid = ref(false)
const isAdressInvalid = ref(false)
const typologyCode = ref<string>('')
const draft = useStore($locationDraft)
const editingResourceId = useStore($editingResourceId)
const isEdit = computed(() => !!editingResourceId.value)

const hasCoordinates = computed(() => {
  return draft.value.coordinates && !!draft.value.coordinates.latitude && !!draft.value.coordinates.longitude
})

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')
  if (id) {
    await ensureDraftLoaded(id)
  }
  initMap()
  if (props.inModal) {
    setTimeout(() => {
      mapInstance?.invalidateSize()
    }, 250)
  }
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
  const defaultLayer = MAP_LAYERS[0]
  new TileLayer(defaultLayer.url, {
    attribution: defaultLayer.attribution,
    subdomains: defaultLayer.subdomains,
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
  window.location.href = localizeHref(isEdit.value ? `/recursos/editar/descricao?id=${editingResourceId.value}` : '/recursos/novo/descricao')
}

function handleCancel() {
  emit('cancel')
}

function handleSubmit(event: Event) {
  const form = event.target as HTMLFormElement
  const isCompleted = form.checkValidity() && hasCoordinates.value
  setStepCompleted('location', isCompleted)
  if (!isCompleted) {
    event.preventDefault()
    if (!hasCoordinates.value) {
      isAdressValid.value = false
      isAdressInvalid.value = true
    }
    return
  }
  if (props.inModal) {
    event.preventDefault()
    emit('save')
  }
}
</script>

<template>
  <form
    :action="localizeHref(isEdit ? `/recursos/editar/contactos?id=${editingResourceId}` : '/recursos/novo/contactos')"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <Grid gap="xs" direction="column">
        <div id="map"></div>
        <p class="u-text-small">
          {{ m['resources.coordinates']() }}
          <template v-if="hasCoordinates"><span class="u-font-monospace">{{ draft.coordinates?.latitude }}</span>, <span class="u-font-monospace">{{ draft.coordinates?.longitude }}</span></template>
          <template v-else>{{ m['resources.no_coordinates']() }}</template>
        </p>
      </Grid>
      <input name="latitude" label="Latitude" type="hidden" required :value="draft.coordinates?.latitude">
      <input name="longitude" label="Longitude" type="hidden" required :value="draft.coordinates?.longitude">
      <wa-input name="location_name" :label="m['resources.location_name_label']()" :hint="m['resources.location_name_hint']()" @input="handleInput" :value="draft.location_name"></wa-input>
      <Grid direction="column" gap="xs">
        <wa-input name="address" :label="m['resources.address_label']()" required @input="handleInput" @change="handleChange" :value="draft.address"></wa-input>
        <p v-if="isAdressInvalid" class="u-text-error">{{ m['resources.address_invalid']() }}</p>
        <p v-else-if="isAdressValid" class="u-text-success">{{ m['resources.address_valid']() }}</p>
      </Grid>
      <wa-input name="postal_code" required :label="m['resources.postal_code_label']()" :pattern="postCodeRegex.source" :hint="m['resources.postal_code_hint']()" @change="handleChange" :value="draft.postal_code"></wa-input>
      

      <wa-radio-group :label="m['resources.accessibility_label']()" name="accessibility" @change="handleInput" required :value="draft.accessibility">
        <wa-radio value="public">{{ m['resources.accessibility_public']() }}</wa-radio>
        <wa-radio value="private">{{ m['resources.accessibility_private']() }}</wa-radio>
      </wa-radio-group>

      <Grid v-if="inModal" justify="end" gap="xs">
        <wa-button variant="neutral" appearance="outlined" type="button" @click="handleCancel">{{ m['resources.cancel']() }}</wa-button>
        <wa-button variant="brand" type="submit">{{ m['resources.save']() }}</wa-button>
      </Grid>
      <Grid v-else justify="end" gap="xs">
        <wa-button variant="primary" appearance="outlined" type="button" @click="handleBack">{{ m['resources.back']() }}</wa-button>
        <wa-button variant="primary" type="submit">{{ m['resources.continue']() }}</wa-button>
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
