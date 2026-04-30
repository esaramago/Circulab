<template>
  <wa-drawer
    id="marker-popup"
    :label="marker?.title"
    :open="open"
    @wa-hide="emit('close')"
  >
    <p>{{ marker?.description }}</p>
  </wa-drawer>
</template>

<script setup lang="ts">
import type { Database } from '@/types/supabase'

type MarkerType = Database['public']['Tables']['pins']['Row']

const props = defineProps<{
  marker: MarkerType,
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