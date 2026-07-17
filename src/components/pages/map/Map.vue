<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { Map, TileLayer, LayerGroup, Marker, DivIcon, type TooltipOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ResourcePopup from './ResourcePopup.vue'
import MapFilters from './MapFilters.vue'
import type { Pin } from '@/types/domain/resource.ts'
import { CONFIG } from '@/config'
import { useStore } from '@nanostores/vue'
import { $selectedLayerId, MAP_LAYERS, selectLayer } from '@/stores/map'
import '@webawesome/button/button.js'
import '@webawesome/dropdown/dropdown.js'
import '@webawesome/dropdown-item/dropdown-item.js'
import '@webawesome/icon/icon.js'

const selectedLayerId = useStore($selectedLayerId)

const props = defineProps<{
  pins: Pin[]
}>()

const activePin = ref<Pin | null>(null)
const mapInstance = ref<Map | null>(null)
const markersLayer = ref<LayerGroup | null>(null)
const activeTileLayer = ref<TileLayer | null>(null)

// Filter state
const filters = ref({
  typology: null as string | null,
  category: null as string | null,
  characteristic: null as string | null,
  search: null as string | null
})

// Compute filtered pins
const filteredPins = computed(() => {
  return props.pins.filter(pin => {
    // Search filter
    if (filters.value.search && !pin.title.toLowerCase().includes(filters.value.search.toLowerCase())) {
      return false
    }
    // Typology filter
    if (filters.value.typology && pin.typology_id !== filters.value.typology) {
      return false
    }
    // Category filter
    if (filters.value.category && pin.category_id !== filters.value.category) {
      return false
    }
    // If characteristic filter is applied but pin doesn't have it, filter out
    // (Note: characteristic filtering would need characteristic data on the pin)
    return true
  })
})

const tooltipSize = 24;
const tooltipAnchor = tooltipSize / 2;



const tooltipOptions = {
  direction: 'top',
  offset: [0, -(tooltipAnchor / 1.5)],
  className: 'c-tooltip'
} as TooltipOptions

function updateTileLayer(layerId: string) {
  if (!mapInstance.value) return

  const layerSettings = MAP_LAYERS.find(l => l.id === layerId) || MAP_LAYERS[0]

  if (activeTileLayer.value) {
    mapInstance.value.removeLayer(activeTileLayer.value)
  }

  const options: Record<string, any> = {
    attribution: layerSettings.attribution,
    maxNativeZoom: 19,
    maxZoom: 22,
  }

  if (layerSettings.subdomains) {
    options.subdomains = layerSettings.subdomains
  }

  const newTileLayer = new TileLayer(layerSettings.url, options)

  newTileLayer.addTo(mapInstance.value)
  activeTileLayer.value = newTileLayer
}

// Watch for layer changes in the store
watch(selectedLayerId, (newLayerId) => {
  updateTileLayer(newLayerId)
})

// Watch for filter changes and update markers
watch(filteredPins, (newPins) => {
  if (mapInstance.value && markersLayer.value) {
    // Clear existing markers
    markersLayer.value.clearLayers()
    // Add new markers
    addPins(newPins, mapInstance.value, markersLayer.value)
  }
}, { deep: true })

onMounted(() => {
  const map = new Map('map', {
    center: [38.74, -9.14], // Lisboa coordinates
    zoom: 14,
  })
  
  mapInstance.value = map
  
  // Initialize the active tile layer
  updateTileLayer(selectedLayerId.value)
  
  // Create markers layer
  const layer = new LayerGroup()
  layer.addTo(map)
  markersLayer.value = layer
  
  // Add initial pins
  addPins(filteredPins.value, map, layer)
})

function addPins(pins: Pin[], map: Map, layer: LayerGroup) {
  pins.forEach(pin => {
    addPin(pin, map, layer)
  })
}

function addPin(pin: Pin, map: Map, layer: LayerGroup) {
  if (!pin?.coordinates) return

  const pinColor = (filters.value.typology && pin.category_color) ? pin.category_color : pin.typology_color
  const customStyle = pinColor ? `background-color: ${pinColor};` : ''
  const pinImage = pin.icon ? `<img src="${CONFIG.images_url + 'pin-images/' + pin.icon}" alt="${pin.title}" class="c-pin__image" />` : ''
  const pinIcon = new DivIcon({
    html: `<div class="c-pin" style="${customStyle}">${pinImage}</div>`,
    iconSize: [tooltipSize, tooltipSize],
    iconAnchor: [tooltipAnchor, tooltipAnchor]
  })

  const tooltipContent = `
    ${pin.title}<br>
    <small>${pin.typology} - ${pin.category}</small>
  `
  const markerLayer = new Marker([
    pin.coordinates.latitude,
    pin.coordinates.longitude],
    { icon: pinIcon })
  .addTo(layer).bindTooltip(tooltipContent, tooltipOptions)

  markerLayer.on('click', () => {
    showPopup(pin)
  })
}

function showPopup(pin: Pin) {
  activePin.value = pin // set active pin
}
</script>

<template>
  <div class="c-map-container">
    <MapFilters v-model="filters" />
    <div id="map"></div>
    
    <div class="map-actions">
      <wa-dropdown placement="bottom-end">
        <wa-button slot="trigger" size="s" variant="neutral">
          <wa-icon name="layer-group" label="Layers"></wa-icon>
        </wa-button>
        <wa-dropdown-item
          v-for="layer in MAP_LAYERS"
          :key="layer.id"
          :checked="selectedLayerId === layer.id"
          @click="selectLayer(layer.id)"
          :class="{ 'is-active': selectedLayerId === layer.id }"
        >
          {{ layer.name }}
        </wa-dropdown-item>
      </wa-dropdown>
    </div>

    <ResourcePopup :open="activePin !== null" :resourceId="activePin?.id ?? null" @close="activePin = null" />
  </div>
</template>

<style>
.c-pin {
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--wa-color-neutral-50);
  border: 1px solid var(--wa-color-brand-30);
  box-sizing: border-box;
  padding: var(--wa-space-2xs);
  border-radius: var(--wa-border-radius-circle);
  font-size: var(--wa-font-size-s);
  font-weight: var(--wa-font-weight-semibold);
  text-align: center;
  line-height: 1;
  transition: transform 160ms ease;
  color: var(--wa-color-neutral-30);
  &:hover {
    transform: scale(1.2);
  }
}
.c-pin__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.leaflet-container {
  font-family: inherit;
}
.leaflet-marker-icon {
  border: none !important;
  background-color: transparent !important;
}
.c-tooltip {
  padding: var(--wa-space-2xs) var(--wa-space-xs);
  font-size: var(--wa-font-size-xs);
  background-color: #FFF;
  line-height: 1;
  opacity: 1 !important;
  font-weight: var(--wa-font-weight-semibold);
  border-color: var(--wa-color-neutral-90);
  border-radius: var(--wa-border-radius-m);
  box-shadow: var(--wa-shadow-m);
  &::before {
    display: none;
  }
}
</style>
<style scoped>
#map {
  position: relative;
  flex: 1;
  overflow: hidden;
  @media (min-width: 768px) {
    border-radius: var(--wa-border-radius-l);
  }
}
.map-actions {
  position: absolute;
  inset-inline-start: 1rem;
  inset-block-start: 10rem;
  z-index: 1001;

  wa-button::part(base) {
    border-radius: var(--wa-border-radius-xs);
    border-color: var(--wa-color-neutral-60);
  }
  .is-active {
    color: var(--wa-color-neutral-20);
    background-color: var(--wa-color-neutral-90);
  }
}
.c-map-container {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>
