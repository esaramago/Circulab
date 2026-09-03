<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { actions } from 'astro:actions'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue'
import { CONFIG } from '@/config'
import '@webawesome/button/button.js'
import '@webawesome/icon/icon.js'
import '@webawesome/callout/callout.js'
import '@webawesome/card/card.js'
import '@webawesome/dialog/dialog.js'
import '@webawesome/input/input.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import { localizeHref } from '@/paraglide/runtime.js'
import { clearAddResourceDraft } from '@/stores/addResource'
import { fetchDB } from '@/utils/fetchDB'
import type { FullResource } from '@/types/domain/resource'
import type { WeekSchedule } from '@/types/add-resource-draft'
import Grid from '@/components/ui/Grid.vue'
import type { TypologyRow, CategoryRow } from '@/types/database'
import { m } from '@/paraglide/messages.js'
import OpeningHoursTable from '@/components/pages/resources/OpeningHoursTable.vue'

const resources = ref<FullResource[]>([])
const typologies = ref<TypologyRow[]>([])
const categories = ref<CategoryRow[]>([])
const openingHours = ref<WeekSchedule | null>(null)

const search = ref('')
const selectedTypology = ref('')
const selectedCategory = ref('')

onMounted(async () => {
  await getResources()
  await getTypologies()
})

async function getResources() {
  const { data, error } = await actions.getFullResources()
  if (error) {
    console.error(error)
  } else {
    resources.value = data as FullResource[]
  }
}

async function getTypologies() {
  const { data, error } = await fetchDB('typologies').select('*').order('name', { ascending: true })
  if (error) {
    console.error('[ResourcesDashboard] Error fetching typologies:', error)
  } else {
    typologies.value = (data ?? []) as TypologyRow[]
  }
}

async function getCategories(typology_id: string) {

  if (!typology_id) return
  const { data, error } = await actions.getCategories({ typology_id })

  if (error) {
    console.error('[ResourcesDashboard] Error fetching categories:', error)
  } else {
    categories.value = (data.categories ?? []) as CategoryRow[]
  }
}

async function handleTypologyChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newTypologyId = target.value || ''
  selectedTypology.value = newTypologyId
  await getCategories(newTypologyId)
}

function handleCategoryChange(event: Event) {
  const target = event.target as HTMLSelectElement
  selectedCategory.value = target.value || ''
}

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  search.value = target.value || ''
}

const filteredResources = computed(() => {
  return resources.value.filter((resource) => {
    if (search.value.trim()) {
      const q = search.value.toLowerCase().trim()
      const titleMatch = resource.title?.toLowerCase().includes(q)
      const descMatch = resource.description?.toLowerCase().includes(q)
      const addressMatch = resource.address?.toLowerCase().includes(q)
      const locationMatch = resource.location?.toLowerCase().includes(q)
      const emailMatch = resource.email?.toLowerCase().includes(q)
      if (!titleMatch && !descMatch && !addressMatch && !locationMatch && !emailMatch) {
        return false
      }
    }

    if (selectedTypology.value && resource.typology_id !== selectedTypology.value) {
      return false
    }

    if (selectedCategory.value && resource.category_id !== selectedCategory.value) {
      return false
    }

    return true
  })
})

const deleteDialogOpen = ref(false)
const resourceToDelete = ref<FullResource | null>(null)
const deleting = ref(false)
const feedback = ref<{ type: 'success' | 'danger'; message: string } | null>(null)

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
      await getResources()
    }
  } catch (err: any) {
    console.error('[ResourcesDashboard] Error deleting resource:', err)
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

function showOpeningHours(resource: FullResource) {
  openingHours.value = resource.opening_hours ?? null
}
</script>

<template>
  <Grid direction="column" gap="l">
    <wa-callout v-if="feedback" :variant="feedback.type">
      {{ feedback.message }}
    </wa-callout>

    <Grid direction="row" gap="s">
      <wa-input
        :label="m['map.search_placeholder']()"
        :placeholder="`${m['map.search_placeholder']()}...`"
        :value="search"
        @input="handleSearchInput"
        with-clear
        @clear="search = ''"
      ></wa-input>
      <wa-select
        :label="m['map.typology']()"
        :value="selectedTypology"
        @input="handleTypologyChange"
        with-clear
        @clear="selectedTypology = ''"
      >
        <wa-option value="">{{ m['resources.all_typologies']() }}</wa-option>
        <wa-option v-for="typology in typologies" :key="typology.id" :value="typology.id">
          {{ typology.name }}
        </wa-option>
      </wa-select>
      <wa-select
        v-if="selectedTypology"
        :label="m['map.category_label']()"
        :value="selectedCategory"
        @input="handleCategoryChange"
        with-clear
        @clear="selectedCategory = ''"
      >
        <wa-option value="">{{ m['resources.all_categories']() }}</wa-option>
        <wa-option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </wa-option>
      </wa-select>
    </Grid>

    <div v-if="filteredResources.length > 0" class="card-container">
      <wa-card v-for="resource in filteredResources" :key="resource.id">


        <img v-if="resource?.images?.[0]" slot="media" :src="CONFIG.images_url + 'pin-images/' + resource?.images?.[0].url" :alt="resource?.title" loading="lazy" />

        <div slot="header">
          <h2>{{ resource.title }}</h2>
          <p>{{ resource?.category }} ({{ resource?.typology }})</p>
        </div>
        
        <Grid gap="xs" direction="column">
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
          <div v-if="resource?.has_opening_hours">
            <wa-icon name="clock"></wa-icon>
            <button
              class="c-link"
              data-dialog="open opening-hours-dialog"
              @click="showOpeningHours(resource)"
            >
              {{ m['map.schedule_heading']() }}
            </button>
          </div>
        </Grid>

        <Grid slot="footer" justify="end" gap="s">
          <wa-button size="s" variant="primary" :href="localizeHref(`/recursos/editar?id=${resource.id}`)" @click="clearAddResourceDraft">
            <wa-icon name="pen"></wa-icon>
            {{ m['map.edit']() }}
          </wa-button>
          <wa-button size="s" variant="danger" @click="confirmDelete(resource)">
            <wa-icon name="trash"></wa-icon>
            {{ m['resources.delete']() }}
          </wa-button>
        </Grid>
      </wa-card>
    </div>
    <div v-else class="empty-state">
      <p>{{ m['resources.no_resources_found']() }}</p>
    </div>
  </Grid>

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

  <wa-dialog
    id="opening-hours-dialog"
    :label="m['map.schedule_heading']()"
    light-dismiss
  >
    <OpeningHoursTable :opening-hours="openingHours" />
  </wa-dialog>
</template>

<style scoped>
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--wa-space-m);
}

.empty-state {
  padding: var(--wa-space-l);
  text-align: center;
  color: var(--wa-color-neutral-70);
}

wa-card {
  > img {
    object-fit: cover;
    height: 180px;
  }
  &::part(body) {
    flex: 1;
  }
  &::part(footer) {
    padding-block: var(--wa-space-m);
  }
}
</style>

