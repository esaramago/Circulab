<script setup lang="ts">
import { CONFIG } from '@/config'
import type { FullResource } from '@/types/domain/resource'
import type { AppUser } from '@/types/domain/user'
import { ref, watch, onMounted, computed } from 'vue'
import { actions } from 'astro:actions'
import Grid from '@/components/ui/Grid.vue'
import { localizeHref } from '@/paraglide/runtime.js'
import { userHasAccess } from '@/utils/userHasAccess'
import { m } from '@/paraglide/messages.js'

const props = defineProps<{
  resourceId: string | null
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const resource = ref<FullResource | null>(null)
const user = ref<AppUser | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

const isCanEdit = computed(() => {
  return user.value ? userHasAccess(user.value, 'dashboard') : false
})

onMounted(async () => {
  const { data } = await actions.checkUser()
  if (data) {
    user.value = data as AppUser
  }
})

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
      resource.value = data as unknown as FullResource
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

          <img v-if="resource?.images?.[0]" class="popup__image" :src="CONFIG.images_url + 'pin-images/' + resource?.images?.[0]?.url" :alt="resource?.title" />
          <div>
            <h2>{{ resource?.title }}</h2>
            <p>{{ resource?.category }} ({{ resource?.typology }})</p>
            <p v-if="resource?.characteristics">{{ resource?.characteristics }}</p>
          </div>

          <Grid gap="xs" direction="column" class="list">
            <div>
              <wa-icon name="location-dot"></wa-icon>
              <template v-if="resource.location">{{resource.location}}, </template>{{resource.address}},
              {{ resource.postal_code }}
            </div>
            <div v-if="resource?.coordinates">
              <wa-icon name="map"></wa-icon>
              <a
                :href="`https://www.google.com/maps/search/?api=1&query=${resource.coordinates.coordinates[1]},${resource.coordinates.coordinates[0]}`"
                target="_blank"
                :title="m['map.open_google_maps']()"
              >
                {{ resource.coordinates.coordinates[1] }}, {{ resource.coordinates.coordinates[0] }}
              </a>
            </div>
            <div v-if="resource?.email">
              <wa-icon name="at"></wa-icon>
              {{ resource.email }}
            </div>
            <div v-if="resource?.phone">
              <wa-icon name="phone"></wa-icon>
              {{ resource.phone }}
            </div>
            <div v-if="resource?.accessibility">
              <template v-if="resource.accessibility === 'private'">
                <wa-icon name="door-closed" size="sm" class="u-color-danger"></wa-icon>
                <span>{{ m['map.access_limited']() }}</span>
              </template>
              <template v-else-if="resource.accessibility === 'public'">
                <wa-icon name="door-open" size="sm" class="u-color-success"></wa-icon>
                <span>{{ m['map.access_public']() }}</span>
              </template>
            </div>
          </Grid>

          <p>{{ resource?.description }}</p>

          <wa-button v-if="isCanEdit || CONFIG.can_suggest" appearance="outlined" :href="localizeHref(`/recursos/editar?id=${resource.id}`)">{{ isCanEdit ? m['map.edit']() : m['map.suggest_edit']() }}</wa-button>

        </Grid>
      </template>
      <template v-else-if="isLoading">
        {{ m['map.loading']() }}
      </template>
      <template v-else-if="hasError">
        {{ m['map.error']() }}
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
  z-index: 1003; /* map + 3 */
  &[open] {
    display: block;
  }

  @media (max-width: 600px) {
    position: fixed;
    --inset: 0;
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
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
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

.list {
  wa-icon {
    padding-inline-end: var(--wa-space-xs);
  }
}
</style>
