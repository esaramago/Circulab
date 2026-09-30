<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { actions } from 'astro:actions'
import { useStore } from '@nanostores/vue'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue'
import ResourceSummary from '@/components/pages/resources/ResourceSummary.vue'
import Grid from '@/components/ui/Grid.vue'
import { CONFIG } from '@/config'
import { $mapFilters, $mapView } from '@/stores/map'
import { clearAddResourceDraft } from '@/stores/addResource'
import { localizeHref } from '@/paraglide/runtime.js'
import { m } from '@/paraglide/messages.js'
import { userHasAccess } from '@/utils/userHasAccess'
import type { FullResource } from '@/types/domain/resource'
import type { AppUser } from '@/types/domain/user'
import '@webawesome/card/card.js'
import '@webawesome/button/button.js'
import '@webawesome/icon/icon.js'
import '@webawesome/callout/callout.js'
import '@webawesome/spinner/spinner.js'

const mapView = useStore($mapView)
const filters = useStore($mapFilters)

const user = ref<AppUser | null>(null)
const resources = ref<FullResource[]>([])
const loading = ref(true)

const deleteDialogOpen = ref(false)
const resourceToDelete = ref<FullResource | null>(null)
const deleting = ref(false)
const feedback = ref<{ type: 'success' | 'danger'; message: string } | null>(null)

const isCanEdit = computed(() => {
  return user.value ? userHasAccess(user.value, 'moderation') : false
})

const isCanDelete = computed(() => {
  return user.value ? userHasAccess(user.value, 'moderation') : false
})

onMounted(async () => {
  try {
    const { data: userData } = await actions.checkUser()
    if (userData) {
      user.value = userData as AppUser
    }
    await loadResources()
  } finally {
    loading.value = false
  }
})

async function loadResources() {
  const { data, error } = await actions.getFullResources()
  if (error) {
    console.error('[ResourceCards] Error fetching resources:', error)
  } else {
    resources.value = (data ?? []) as FullResource[]
  }
}

const filteredResources = computed(() => {
  return resources.value.filter((resource) => {
    // Search filter
    if (filters.value.search && filters.value.search.trim()) {
      const q = filters.value.search.toLowerCase().trim()
      const titleMatch = resource.title?.toLowerCase().includes(q)
      const descMatch = resource.description?.toLowerCase().includes(q)
      const addressMatch = resource.address?.toLowerCase().includes(q)
      const locationMatch = resource.location?.toLowerCase().includes(q)
      const emailMatch = resource.email?.toLowerCase().includes(q)
      if (!titleMatch && !descMatch && !addressMatch && !locationMatch && !emailMatch) {
        return false
      }
    }

    // Typology filter
    if (filters.value.typology && resource.typology_id !== filters.value.typology) {
      return false
    }

    // Category filter
    if (filters.value.category && resource.category_id !== filters.value.category) {
      return false
    }

    // Characteristics filter
    if (filters.value.characteristics && filters.value.characteristics.length > 0) {
      const resourceChars = resource.characteristics_ids || []
      const matchesCharacteristics = filters.value.characteristics.every((charId) =>
        resourceChars.includes(charId)
      )
      if (!matchesCharacteristics) {
        return false
      }
    }

    return true
  })
})

function confirmDelete(resource: FullResource) {
  resourceToDelete.value = resource
  feedback.value = null
  deleteDialogOpen.value = true
}

async function handleDelete() {
  if (!resourceToDelete.value) return
  deleting.value = true
  feedback.value = null

  try {
    const { data, error } = await actions.deleteResource({ id: resourceToDelete.value.id })
    if (error) throw error

    if (data?.success) {
      feedback.value = { type: 'success', message: m['resources.deleted_success']() }
      deleteDialogOpen.value = false
      await loadResources()
    }
  } catch (err: any) {
    console.error('[ResourceCards] Error deleting resource:', err)
    feedback.value = {
      type: 'danger',
      message: err.message || m['resources.delete_error']()
    }
    deleteDialogOpen.value = false
  } finally {
    deleting.value = false
    resourceToDelete.value = null
  }
}
</script>

<template>
  <div v-show="mapView === 'cards'" class="c-cards-view">
    <wa-callout v-if="feedback" :variant="feedback.type" class="feedback-callout">
      {{ feedback.message }}
    </wa-callout>

    <div v-if="loading" class="loading-state">
      <wa-spinner></wa-spinner>
    </div>

    <div v-else-if="filteredResources.length > 0" class="card-container">
      <wa-card v-for="resource in filteredResources" :key="resource.id">
        <img
          v-if="resource?.images?.[0]"
          slot="media"
          :src="CONFIG.images_url + 'pin-images/' + resource?.images?.[0].url"
          :alt="resource?.title"
          loading="lazy"
        />

        <div slot="header">
          <h2>{{ resource.title }}</h2>
          <p>{{ resource?.category }} ({{ resource?.typology }})</p>
        </div>

        <ResourceSummary
          :resource="resource"
          :show-header="false"
          :show-description="false"
          :show-networks="false"
        />

        <Grid v-if="isCanEdit || isCanDelete" slot="footer" justify="end" gap="s">
          <wa-button
            v-if="isCanEdit"
            size="s"
            variant="primary"
            :href="localizeHref(`/recursos/editar?id=${resource.id}`)"
            @click="clearAddResourceDraft"
          >
            <wa-icon name="pen"></wa-icon>
            {{ isCanEdit ? m['map.edit']() : m['map.suggest_edit']() }}
          </wa-button>
          <wa-button
            v-if="isCanDelete"
            size="s"
            variant="danger"
            @click="confirmDelete(resource)"
          >
            <wa-icon name="trash"></wa-icon>
            {{ m['resources.delete']() }}
          </wa-button>
        </Grid>
      </wa-card>
    </div>

    <div v-else class="empty-state">
      <p>{{ m['resources.no_resources_found']() }}</p>
    </div>

    <ConfirmationDialog
      v-model:open="deleteDialogOpen"
      :title="m['resources.delete_confirm_title']()"
      :confirm-label="m['resources.delete']()"
      variant="danger"
      :loading="deleting"
      @confirm="handleDelete"
    >
      <p>{{ m['resources.delete_confirm_msg']({ title: resourceToDelete?.title || '' }) }}</p>
      <p class="u-color-danger"><small>{{ m['resources.cannot_be_undone']() }}</small></p>
    </ConfirmationDialog>
  </div>
</template>

<style scoped>
.c-cards-view {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-m);
  width: 100%;
}

.feedback-callout {
  margin-block-end: var(--wa-space-s);
}

.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--wa-space-m);
}

.loading-state,
.empty-state {
  padding: var(--wa-space-l);
  text-align: center;
  color: var(--wa-color-neutral-70);
}

wa-card {
  > img {
    object-fit: cover;
    max-height: 40rem;
  }
  &::part(body) {
    flex: 1;
  }
  &::part(footer) {
    padding-block: var(--wa-space-m);
  }
}
</style>
