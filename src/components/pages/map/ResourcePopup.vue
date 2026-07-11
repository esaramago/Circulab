<script setup lang="ts">
import { CONFIG } from '@/config'
import type { ResourcePopup } from '@/types/domain/resource'
import { ref, watch } from 'vue'
import { actions } from 'astro:actions'
import Grid from '@/components/ui/Grid.vue'

const props = defineProps<{
  resourceId: string | null
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const resource = ref<ResourcePopup | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

watch(() => props.resourceId, async () => {
  hasError.value = false
  if (props.resourceId) {
    resource.value = null
    isLoading.value = true
    const { data, error } = await actions.getResource({ id: props.resourceId })
    isLoading.value = false
    if (error) {
      console.error(error)
      hasError.value = true
    } else {
      console.log(data)
      resource.value = data as unknown as ResourcePopup
    }
  } else {
    hasError.value = true
    isLoading.value = false
  }
}, { immediate: true })
</script>

<template>
  <div class="popup" :open="open || null" id="marker-popup">
    <div class="popup__wrapper">
      <template v-if="resource">
        <wa-button class="popup__close" variant="neutral" @click="emit('close')" pill size="xs">
          <wa-icon name="close"></wa-icon>
        </wa-button>
        <Grid gap="l" direction="column">

          <img v-if="resource?.images?.[0]" class="popup__image" :src="CONFIG.images_url + resource?.images?.[0]?.url" :alt="resource?.title" />
          <div>
            <h2>{{ resource?.title }}</h2>
            <p>{{ resource?.category }} ({{ resource?.typology }})</p>
            <p v-if="resource?.characteristics">{{ resource?.characteristics }}</p>
          </div>

          <Grid gap="xs" direction="column">
            <div>
              <wa-icon name="location-dot"></wa-icon>
              {{resource?.location}}, {{ resource?.address }}, {{ resource?.postal_code }}
            </div>
            <div v-if="resource?.coordinates">
              <wa-icon name="map"></wa-icon>
              <a
                :href="`https://www.google.com/maps/search/?api=1&query=${resource.coordinates.coordinates[1]},${resource.coordinates.coordinates[0]}`"
                target="_blank"
                title="Abrir no Google Maps"
              >
                {{ resource.coordinates.coordinates[1] }}, {{ resource.coordinates.coordinates[0] }}
              </a>
            </div>
            <div v-if="resource?.email">
              <wa-icon name="email"></wa-icon>
              {{ resource.email }}
            </div>
            <div v-if="resource?.phone">
              <wa-icon name="phone"></wa-icon>
              {{ resource.phone }}
            </div>
          </Grid>

          <p>{{ resource?.description }}</p>

          <wa-button appearance="outlined">Sugerir edição</wa-button>

        </Grid>
      </template>
      <template v-else-if="isLoading">
        LOADING...
      </template>
      <template v-else-if="hasError">
        ERRO
      </template>
    </div>
  </div>
</template>

<style scoped>
.popup {
  --inset: var(--wa-space-m);
  --padding: var(--wa-space-m);
  --border-radius: var(--wa-border-radius-m);
  position: absolute;
  width: clamp(30rem, 30vw, 40rem);
  inset: var(--inset) var(--inset) var(--inset) auto;
  display: none;
  z-index: 1002; /* map + 2 */
  &[open] {
    display: block;
  }

  @media (max-width: 600px) {
    --inset: 0;
    --border-radius: 0;
    width: auto;
    inset: auto var(--inset) var(--inset) var(--inset);
  }
}
.popup__close {
  position: absolute;
  inset-block-start: var(--wa-space-l);
  inset-inline-end: var(--wa-space-l);
}
.popup__wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-s);
  max-height: 100%;
  box-sizing: border-box;
  padding: var(--padding);
  background-color: var(--wa-color-neutral-20);
  border-radius: calc(var(--border-radius) + var(--padding) / 2);
  @media (max-width: 600px) {
    max-height: 50vh;
  }
}
.popup__body {
  overflow: auto;
  padding-inline-end: var(--padding);
}
.popup__image {
  width: 100%;
  height: 20rem;
  object-fit: cover;
  border-radius: var(--wa-border-radius-m);
}
</style>
