<template>
  <div id="map"></div>
  <MarkerPopup :open="activeMarker !== null" :marker="activeMarker" @close="activeMarker = null" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Map, TileLayer, LayerGroup, Marker, DivIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MarkerPopup from './MarkerPopup.vue'
import type { Marker as MarkerType } from '@/types/data'

const props = defineProps<{
  markers: MarkerType[]
}>()

const activeMarker = ref<MarkerType | null>(null)

const tree = {}
function ensureGroup(typology: MarkerType['typology'], category: MarkerType['category']) {
  tree[typology] ??= {}
  tree[category] ??= new LayerGroup()
  return tree[category]
}

const tooltipSize = 24;
const tooltipAnchor = tooltipSize / 2;

const pin = new DivIcon({
  html: `<div class="c-marker">O</div>`,
  iconSize: [tooltipSize, tooltipSize],
  iconAnchor: [tooltipAnchor, tooltipAnchor]
})

const tooltipOptions = {
  direction: 'top',
  offset: [0, -(tooltipAnchor / 1.5)],
  className: 'c-tooltip'
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

  //const markersLayer = new LayerGroup()
  //markersLayer.addTo(map)
  addMarkers(props.markers, map/* , markersLayer */)
})

function addMarkers(markers: MarkerType[], map: Map) {
  markers.forEach(marker => {
    //const group = ensureGroup(marker.typology, marker.category, marker.characteristics)
    //group.addTo(map)
    addMarker(marker, map)
  })
}
function addMarker(marker: MarkerType, map: Map) {

  if (!marker?.coordinates) return

  const markerLayer = new Marker([
    marker.coordinates.latitude,
    marker.coordinates.longitude],
    { icon: pin })
  .addTo(map).bindTooltip(marker.title, tooltipOptions)

  markerLayer.on('click', () => {
    showPopup(marker)
  })
}

function showPopup(marker: MarkerType) {
  activeMarker.value = marker // set active marker
}
</script>

<style scoped>
#map {
  flex: 1;
  overflow: hidden;
  @media (min-width: 768px) {
    border-radius: var(--wa-border-radius-l);
  }
}
</style>

<style>
.leaflet-container {
  font-family: inherit;
}
.leaflet-marker-icon {
  border: none !important;
  background-color: transparent !important;
}
.c-marker {
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