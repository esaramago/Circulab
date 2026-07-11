<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { Map, TileLayer, LayerGroup, Marker, DivIcon, type TooltipOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ResourcePopup from './ResourcePopup.vue'
import MapFilters from './MapFilters.vue'
import type { Pin } from '@/types/domain/resource.ts'

const props = defineProps<{
  pins: Pin[]
}>()

const activePin = ref<Pin | null>(null)
const mapInstance = ref<Map | null>(null)
const markersLayer = ref<LayerGroup | null>(null)

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

const pinIcon = new DivIcon({
  html: `<div class="c-pin">O</div>`,
  iconSize: [tooltipSize, tooltipSize],
  iconAnchor: [tooltipAnchor, tooltipAnchor]
})

const tooltipOptions = {
  direction: 'top',
  offset: [0, -(tooltipAnchor / 1.5)],
  className: 'c-tooltip'
} as TooltipOptions

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
  
  new TileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxNativeZoom: 19,
    maxZoom: 22,
  }).addTo(map)

  mapInstance.value = map
  
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

  const markerLayer = new Marker([
    pin.coordinates.latitude,
    pin.coordinates.longitude],
    { icon: pinIcon })
  .addTo(layer).bindTooltip(pin.title, tooltipOptions)

  markerLayer.on('click', () => {
    showPopup(pin)
  })
}

function showPopup(pin: Pin) {
  activePin.value = pin // set active pin
}
</script>

<style scoped>
#map {
  position: relative;
  flex: 1;
  overflow: hidden;
  @media (min-width: 768px) {
    border-radius: var(--wa-border-radius-l);
  }
}
</style>

<template>
  <div class="c-map-container">
    <MapFilters v-model="filters" />
    <div id="map"></div>
    <ResourcePopup :open="activePin !== null" :resourceId="activePin?.id ?? null" @close="activePin = null" />
  </div>
</template>

<style>
.c-map-container {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.leaflet-container {
  font-family: inherit;
}
.leaflet-marker-icon {
  border: none !important;
  background-color: transparent !important;
}
.c-pin {
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--wa-color-brand-50);
  border: 2px solid var(--wa-color-brand-20);
  box-sizing: border-box;
  border-radius: var(--wa-border-radius-circle);
  font-size: var(--wa-font-size-s);
  font-weight: var(--wa-font-weight-semibold);
  text-align: center;
  line-height: 1;
  transition: transform 160ms ease;
  &:hover {
    transform: scale(1.2);
  }
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
