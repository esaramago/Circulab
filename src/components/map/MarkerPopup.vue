<template>
  <div class="c-popup" :open="open || null" id="marker-popup">
    <div class="c-popup__wrapper">
      <div class="c-popup__header">
        <h2>{{ marker?.title }}</h2>
        <wa-button class="c-popup__close" variant="neutral" @click="emit('close')" pill size="xs">
          <wa-icon name="close"></wa-icon>
        </wa-button>
      </div>
      <div class="c-popup__body">

        <img class="c-popup__image" :src="CONFIG.images_url + marker?.images?.[0]?.url" :alt="marker?.title" />
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

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CONFIG } from '@/config'
import type { Marker } from '@/types/data'

const props = defineProps<{
  marker: Marker | null,
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

</script>

<style scoped>
.c-popup {
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
.c-popup__wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-s);
  max-height: 100%;
  box-sizing: border-box;
  padding: var(--padding) 0 var(--padding) var(--padding);
  background-color: var(--wa-color-neutral-20);
  border-radius: calc(var(--border-radius) + var(--padding) / 2);
  @media (max-width: 600px) {
    max-height: 50vh;
  }
}
.c-popup__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-inline-end: var(--padding);
}
.c-popup__body {
  overflow: auto;
  padding-inline-end: var(--padding);
}
.c-popup__image {
  width: 100%;
  height: 20rem;
  object-fit: cover;
  border-radius: var(--wa-border-radius-m);
}
</style>