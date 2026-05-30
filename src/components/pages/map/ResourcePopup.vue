<script setup lang="ts">
import { CONFIG } from '@/config'
import type { ResourcePopup } from '@/types/domain/resource'
import { ref, watch } from 'vue'
import { actions } from 'astro:actions'

const props = defineProps<{
  resourceId: string | null
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const resource = ref<ResourcePopup | null>(null)

watch(() => props.resourceId, async () => {
  if (props.resourceId) {
    const { data, error } = await actions.getResource({ id: props.resourceId })
    if (error) {
      console.error(error)
    } else {
      console.log(data)
      resource.value = data as unknown as ResourcePopup
    }
  }
})
</script>

<template>
  <div class="c-popup" :open="open || null" id="marker-popup">
    <div class="c-popup__wrapper">
      <div class="c-popup__header">
        <h2>{{ resource?.title }}</h2>
        <wa-button class="c-popup__close" variant="neutral" @click="emit('close')" pill size="xs">
          <wa-icon name="close"></wa-icon>
        </wa-button>
      </div>
      <div class="c-popup__body">

        <img v-if="resource?.images?.[0]" class="c-popup__image" :src="CONFIG.images_url + resource?.images?.[0]?.url" :alt="resource?.title" />
        <p>{{ resource?.category }} ({{ resource?.typology }})</p>
        <p>{{ resource?.characteristics }}</p>

        <ul>
          <li>{{ resource?.location }}</li>
          <li>{{ resource?.location.address }}, {{ resource?.location.postal_code }}</li>
          <li>{{ resource?.coordinates.coordinates[1] }}, {{ resource?.coordinates.coordinates[0] }}</li>
          <li v-if="resource?.location.email">{{ resource?.location.email }}</li>
          <li v-if="resource?.location.phone">{{ resource?.location.phone }}</li>
        </ul>

        <p>{{ resource?.description }}</p>

        <wa-button appearance="outlined">Sugerir edição</wa-button>

      </div>
    </div>
  </div>
</template>

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
