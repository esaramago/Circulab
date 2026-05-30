<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Map, TileLayer, LayerGroup, Marker, DivIcon, type TooltipOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import ResourcePopup from './ResourcePopup.vue'
import MapFilters from './MapFilters.vue'
import type { Pin } from '@/types/domain/resource.ts'

const props = defineProps<{
  pins: Pin[]
}>()

const activePin = ref<Pin | null>(null)

const tree = {}
/* function ensureGroup(typology: Pin['typology_id'], category: Pin['category_id']) {
  tree[typology] ??= {}
  tree[category] ??= new LayerGroup()
  return tree[category]
} */

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

  //const markersLayer = new LayerGroup()
  //markersLayer.addTo(map)
  addPins(props.pins, map/* , resourcesLayer */)
})

function addPins(pins: Pin[], map: Map) {
  pins.forEach(pin => {
    //const group = ensureGroup(marker.typology, marker.category, marker.characteristics)
    //group.addTo(map)
    addPin(pin, map)
  })
}
function addPin(pin: Pin, map: Map) {

  if (!pin?.coordinates) return

  const markerLayer = new Marker([
    pin.coordinates.latitude,
    pin.coordinates.longitude],
    { icon: pinIcon })
  .addTo(map).bindTooltip(pin.title, tooltipOptions)

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
    <MapFilters />
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
