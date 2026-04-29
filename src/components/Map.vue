<template>
  <div id="map"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { Map, TileLayer, Marker, Popup } from 'leaflet'
import 'leaflet/dist/leaflet.css'
//import 'leaflet.markercluster/dist/MarkerCluster.css'
//import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

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
});
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