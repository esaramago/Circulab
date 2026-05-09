<template>
  <wa-drawer
    id="marker-popup"
    :label="marker?.title"
    :open="open"
    @wa-hide="emit('close')"
  >
    <img :src="CONFIG.images_url + marker?.images?.[0]?.url" :alt="marker?.title" />
    <p>{{ marker?.category }} ({{ marker?.typology }})</p>
    <p>{{ marker?.characteristics }}</p>

    <ul>
      <li>{{ marker?.location }}</li>
      <li>{{ marker?.address }}, {{ marker?.postal_code }}</li>
      <li>{{ marker?.coordinates?.latitude }}, {{ marker?.coordinates?.longitude }}</li>
      <li v-if="marker?.email">{{ marker?.email }}</li>
      <li v-if="marker?.phone">{{ marker?.phone }}</li>
    </ul>

    <p>{{ marker?.description }}</p>

    <wa-button appearance="outlined">Sugerir edição</wa-button>
  </wa-drawer>
</template>

<script setup lang="ts">
import { CONFIG } from '@/config'
import type { Marker } from '@/types/data'

const props = defineProps<{
  marker: Marker,
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

</script>

<style scoped>
#marker-popup {
  --size: clamp(48rem, 30vw, 80rem);
}
</style>