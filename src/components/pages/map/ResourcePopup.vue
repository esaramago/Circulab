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
import ResourceSummary from '@/components/pages/resources/ResourceSummary.vue'


const props = defineProps<{
  resourceId: string | null
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const resource = ref<FullResource | null>(null)
const user = ref<AppUser | null>(null)
const isLoading = ref(false)
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
    const { data, error } = await actions.getResource({ id: String(props.resourceId) })
    isLoading.value = false
    if (error) {
      console.error('[ResourcePopup] Error loading resource:', error)
      hasError.value = true
    } else {
      resource.value = data as unknown as FullResource
    }
  } else {
    resource.value = null
    isLoading.value = false
    hasError.value = false
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

          <ResourceSummary :resource="resource" />

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
  inset: var(--inset) var(--inset) auto auto;
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
  overflow: auto;
  padding: var(--padding);
  background-color: var(--wa-color-neutral-20);
  border-radius: calc(var(--border-radius) + var(--padding) / 2);
  @media (max-width: 600px) {
    max-height: 70vh;
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
  max-height: 40rem;
  object-fit: cover;
  border-radius: var(--wa-border-radius-m);
  @media (max-height: 768px) {
    max-height: 20rem;
    aspect-ratio: 16 / 9;
  }
}
</style>

