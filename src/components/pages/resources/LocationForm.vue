<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import '@webawesome/checkbox/checkbox.js'
import '@webawesome/radio/radio.js'
import '@webawesome/radio-group/radio-group.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import { onMounted, watch, ref, computed } from 'vue'
import { useStore } from '@nanostores/vue'
import { Map as LeafletMap, Marker as LeafletMarker, TileLayer } from 'leaflet'
import type { Map as LeafletMapType, Marker as LeafletMarkerType } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { $locationDraft, $descriptionDraft, setStepCompleted } from '@/stores/addResource'
import type { LocationDraft } from '@/types/add-resource-draft'
import { fetchDB } from '@/utils/fetchDB'
import phoneAreaCodes from '@/data/countryCodes.json'

let mapInstance: LeafletMapType | null = null
let markerInstance: LeafletMarkerType | null = null

const nominatimHeaders = {
  'Accept-Language': 'pt',
  'User-Agent': 'Circulab/0.0.1 (https://gitlab.com/emanuelsaramago/circulab)',
}

const typologyCode = ref<string>('')
const draft = useStore($locationDraft)
const isTypologyRepairMap = computed(() => {
  return typologyCode.value === 'repair-map'
})
const sortedPhoneAreaCodes = computed(() => {
  const sorted = [...phoneAreaCodes].sort((a, b) => a.name.localeCompare(b.name))
  const portugalIndex = sorted.findIndex(code => code.code === 'PT')
  if (portugalIndex > -1) {
    const [portugal] = sorted.splice(portugalIndex, 1)
    return [portugal, ...sorted]
  }
  return sorted
})

const phoneSelectRef = ref<any>(null)

watch(() => draft.value.phone_area_code, async newVal => {
  if (typeof window !== 'undefined' && phoneSelectRef.value) {
    await window.customElements.whenDefined('wa-select')
    await phoneSelectRef.value.updateComplete
    const codeNum = Number(newVal)
    phoneSelectRef.value.displayLabel = (!isNaN(codeNum) && codeNum > 0) ? `+${codeNum}` : ''
  }
}, { flush: 'post' })

onMounted(async () => {
  initMap()
  typologyCode.value = await getTypologyCode() || ''

  const currentAreaCode = Number(draft.value.phone_area_code)
  if (isNaN(currentAreaCode) || currentAreaCode <= 0) {
    updateDraft({ phone_area_code: null })
  }

  if (phoneSelectRef.value && draft.value.phone_area_code) {
    await window.customElements.whenDefined('wa-select')
    await phoneSelectRef.value.updateComplete
    const codeNum = Number(draft.value.phone_area_code)
    phoneSelectRef.value.displayLabel = (!isNaN(codeNum) && codeNum > 0) ? `+${codeNum}` : ''
  }
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
    ...$locationDraft.get(),
    ...partial,
  })
}

function initMap() {
  const initialLat = draft.value.coordinates.latitude || 38.74
  const initialLng = draft.value.coordinates.longitude || -9.14

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

  markerInstance.on('dragend', () => {
    const position = markerInstance?.getLatLng()
    if (position) {
      const latitude = Number(position.lat.toFixed(6))
      const longitude = Number(position.lng.toFixed(6))
      updateDraft({ coordinates: { latitude, longitude } })
      fetchAddress(latitude, longitude)
    }
  })

  mapInstance.on('click', (e: { latlng: { lat: number, lng: number } }) => {
    markerInstance?.setLatLng(e.latlng)
    const latitude = Number(e.latlng.lat.toFixed(6))
    const longitude = Number(e.latlng.lng.toFixed(6))
    updateDraft({ coordinates: { latitude, longitude } })
    fetchAddress(latitude, longitude)
  })
}

async function fetchAddress(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: nominatimHeaders },
    )
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
      updateDraft({
        address,
        postal_code: data.address.postcode || '',
      })
    }
  } catch (error) {
    console.error('Error fetching address:', error)
  }
}

watch(() => [draft.value.coordinates.latitude, draft.value.coordinates.longitude], ([lat, lng]) => {
  if (mapInstance && markerInstance) {
    const numLat = Number(lat)
    const numLng = Number(lng)

    if (!isNaN(numLat) && !isNaN(numLng) && numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180) {
      const currentLatLng = markerInstance.getLatLng()
      if (currentLatLng.lat !== numLat || currentLatLng.lng !== numLng) {
        markerInstance.setLatLng([numLat, numLng])
        mapInstance.setView([numLat, numLng])
      }
    }
  }
})

async function handleInput(event: Event) {
  const field = event.target as HTMLInputElement
  const name = field.name as keyof LocationDraft
  let value: LocationDraft[keyof LocationDraft] = field.value as never

  if (name === 'latitude' || name === 'longitude') {
    value = field.value === '' ? undefined : Number(field.value)
  } else if (name === 'phone') {
    value = field.value === '' ? undefined : Number(field.value)
  } else if (name === 'accessibility') {
    value = field.value as LocationDraft['accessibility']
  }

  if (!field.checkValidity()) return

  updateDraft({ [name]: value } as Partial<LocationDraft>)
}

async function handleChange(event: Event) {

  if (!isTypologyRepairMap.value) return

  const field = event.target as HTMLInputElement
  const name = field.name as keyof LocationDraft

  if (name !== 'address' && name !== 'postal_code') return
  if (!field.checkValidity()) return

  if (name === 'postal_code') {
    updateDraft({ postal_code: field.value })
  }

  const address = (name === 'address' ? field.value : draft.value.address)?.trim()
  const postal_code = (name === 'postal_code' ? field.value : draft.value.postal_code)?.trim()
  if (!address || !postal_code) return

  const coordinates = await guessCoordinates(address, postal_code)
  if (coordinates) {
    updateDraft({
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      }
    })
  }
}

function handleChangeDialCode(event: Event) {
  const target = event.target as any
  const value = target.value ? Number(target.value) : null
  updateDraft({ phone_area_code: value })
}

async function guessCoordinates(
  address: string,
  postal_code: string
): Promise<{ latitude: number, longitude: number } | null> {
  const street = address.trim()
  const postcode = postal_code.trim()
  if (!street || !postcode) {
    return null
  }

  try {
    const params = new URLSearchParams({
      format: 'json',
      limit: '1',
      street,
      postalcode: postcode,
      countrycodes: 'pt',
    })
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: nominatimHeaders },
    )
    const data = await response.json() as Array<{ lat?: string, lon?: string }>
    const result = data?.[0]
    if (!result?.lat || !result?.lon) {
      return null
    }
    return {
      latitude: Number(parseFloat(result.lat).toFixed(6)),
      longitude: Number(parseFloat(result.lon).toFixed(6)),
    }
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

function handleBack() {
  window.location.href = '/recursos/novo/descricao'
}

function handleSubmit(event: Event) {
  const isCompleted = (event.target as HTMLFormElement).checkValidity()
  setStepCompleted('location', isCompleted)
  if (!isCompleted) {
    event.preventDefault()
  }
}
</script>

<template>
  <form
    action="/recursos/novo/resumo"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <div id="map"></div>
      <wa-input name="location_name" label="Nome do local" @input="handleInput" :value="draft.location_name"></wa-input>
      <fieldset :class="{ 'is-hidden': isTypologyRepairMap }">
        <legend appearance="h2">Coordenadas</legend>
        <Grid fullWidth>
          <wa-input name="latitude" type="number" step="any" label="Latitude" required @input="handleInput" hint="Formato: 38,730000" :value="draft.coordinates.latitude"></wa-input>
          <wa-input name="longitude" type="number" step="any" label="Longitude" required @input="handleInput" hint="Formato: -9,130000" :value="draft.coordinates.longitude"></wa-input>
        </Grid>
      </fieldset>
      <wa-input name="address" label="Morada" required @input="handleInput" @change="handleChange" :value="draft.address"></wa-input>
      <wa-input name="postal_code" required label="Código postal" pattern="^(\d{4})-(\d{3})$" hint="Formato: 1234-567" @change="handleChange" :value="draft.postal_code"></wa-input>

      <wa-radio-group label="Acessibilidade" name="accessibility" @change="handleInput" required :value="draft.accessibility">
        <wa-radio value="public">Acessível ao público</wa-radio>
        <wa-radio value="private">Local privado</wa-radio>
      </wa-radio-group>

      <h3>Contactos</h3>
      <wa-input name="email" type="email" label="Email" :value="draft.email" @input="handleInput"></wa-input>
      <fieldset>
        <legend appearance="p">Telefone</legend>
        <Grid>
          <wa-select ref="phoneSelectRef" id="phone_area_code" class="phone-area-code" name="phone_area_code" label="Indicativo" :value="draft.phone_area_code ? String(draft.phone_area_code) : ''" @change="handleChangeDialCode">
            <wa-option v-for="code in sortedPhoneAreaCodes" :key="code.code" :value="String(code.dial_code)">
              {{code.name}} <span class="u-nowrap">(+{{code.dial_code}})</span>
            </wa-option>
          </wa-select>
          <wa-input class="phone" name="phone" label="Telefone" :value="draft.phone" @input="handleInput"></wa-input>
        </Grid>
      </fieldset>
      <h3>Canais</h3>
      <wa-input name="website" type="url" label="Website" :value="draft.website" @input="handleInput"></wa-input>
      <wa-input name="instagram" type="url" label="Instagram" :value="draft.instagram" @input="handleInput"></wa-input>
      <wa-input name="facebook" type="url" label="Facebook" :value="draft.facebook" @input="handleInput"></wa-input>
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
.phone-area-code {
  width: 120px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.phone-area-code::part(listbox) {
  min-width: 250px;
}
.phone {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
