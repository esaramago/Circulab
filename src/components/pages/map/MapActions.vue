<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useStore } from '@nanostores/vue'
import '@webawesome/button/button.js'
import '@webawesome/button-group/button-group.js'
import '@webawesome/icon/icon.js'
import Grid from '@/components/ui/Grid.vue'
import { CONFIG } from '@/config'
import { localizeHref } from '@/paraglide/runtime.js'
import { m } from '@/paraglide/messages.js'
import { $mapView, setMapView, type MapViewMode } from '@/stores/map'

const props = defineProps<{
  initialView?: MapViewMode
}>()

const mapView = useStore($mapView)

function applyView(mode: MapViewMode, updateUrl = true) {
  setMapView(mode)

  if (updateUrl && typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    if (mode === 'cards') {
      url.searchParams.set('view', 'cards')
    } else {
      url.searchParams.delete('view')
    }
    window.history.replaceState(null, '', url.toString())
  }
}

function handlePopState() {
  const url = new URL(window.location.href)
  const mode: MapViewMode = url.searchParams.get('view') === 'cards' ? 'cards' : 'map'
  applyView(mode, false)
}

onMounted(() => {
  const url = new URL(window.location.href)
  const viewParam = url.searchParams.get('view')
  const activeView: MapViewMode = viewParam === 'cards' ? 'cards' : (props.initialView ?? 'map')
  applyView(activeView, false)

  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})

watch(() => props.initialView, (newVal) => {
  if (newVal) {
    applyView(newVal, false)
  }
})
</script>

<template>
  <Grid justify="end" wrap>
    <wa-button
      variant="brand"
      :href="localizeHref('/recursos/novo')"
    >
      <wa-icon name="plus"></wa-icon>
      <span class="is-hidden-mobile">{{ m['map.suggest_resource']() }}</span>
    </wa-button>
    <wa-button-group label="Visualização">
      <wa-button
        :variant="mapView === 'map' ? 'brand' : undefined"
        @click="applyView('map')"
      >
        <wa-icon name="map" label="Vista de mapa"></wa-icon>
      </wa-button>
      <wa-button
        :variant="mapView === 'cards' ? 'brand' : undefined"
        @click="applyView('cards')"
      >
        <wa-icon name="border-all" label="Vista de cartões"></wa-icon>
      </wa-button>
    </wa-button-group>
  </Grid>
</template>
