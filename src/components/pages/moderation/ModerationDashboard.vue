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
import '@webawesome/textarea/textarea.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import '@webawesome/badge/badge.js'
import type { SuggestedResource } from '@/types/domain/resource'
import type { WeekSchedule } from '@/types/add-resource-draft'
import Grid from '@/components/ui/Grid.vue'
import type { TypologyRow, CategoryRow } from '@/types/database'
import { m } from '@/paraglide/messages.js'
import OpeningHoursTable from '@/components/pages/resources/OpeningHoursTable.vue'
import ResourceSummary from '@/components/pages/resources/ResourceSummary.vue'
import geojson from '@/utils/geojson'

const suggestions = ref<SuggestedResource[]>([])
const typologies = ref<TypologyRow[]>([])
const categories = ref<CategoryRow[]>([])
const editCategories = ref<CategoryRow[]>([])
const openingHours = ref<WeekSchedule | null>(null)

const search = ref('')
const selectedTypology = ref('')
const selectedCategory = ref('')

const acceptDialogOpen = ref(false)
const suggestionToAccept = ref<SuggestedResource | null>(null)
const accepting = ref(false)

const rejectDialogOpen = ref(false)
const suggestionToReject = ref<SuggestedResource | null>(null)
const rejecting = ref(false)

const editDialogOpen = ref(false)
const editingSuggestion = ref<any>(null)
const savingEdit = ref(false)

const feedback = ref<{ type: 'success' | 'danger'; message: string } | null>(null)

onMounted(async () => {
  await getSuggestions()
  await getTypologies()
})

async function getSuggestions() {
  const { data, error } = await actions.getSuggestedResources()
  if (error) {
    console.error('[ModerationDashboard] Error fetching suggestions:', error)
  } else {
    suggestions.value = (data ?? []) as SuggestedResource[]
  }
}

async function getTypologies() {
  const { data, error } = await actions.getTypologies()
  if (error) {
    console.error('[ModerationDashboard] Error fetching typologies:', error)
  } else {
    typologies.value = (data?.typologies ?? []) as TypologyRow[]
  }
}

async function getCategories(typology_id: string) {
  if (!typology_id) return
  const { data, error } = await actions.getCategories({ typology_id })
  if (error) {
    console.error('[ModerationDashboard] Error fetching categories:', error)
  } else {
    categories.value = (data.categories ?? []) as CategoryRow[]
  }
}

async function getEditCategories(typology_id: string) {
  if (!typology_id) {
    editCategories.value = []
    return
  }
  const { data, error } = await actions.getCategories({ typology_id })
  if (error) {
    console.error('[ModerationDashboard] Error fetching edit categories:', error)
  } else {
    editCategories.value = (data.categories ?? []) as CategoryRow[]
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

const filteredSuggestions = computed(() => {
  return suggestions.value.filter((resource) => {
    if (search.value.trim()) {
      const q = search.value.toLowerCase().trim()
      const titleMatch = resource.title?.toLowerCase().includes(q)
      const descMatch = resource.description?.toLowerCase().includes(q)
      const addressMatch = resource.address?.toLowerCase().includes(q)
      const locationMatch = resource.location?.toLowerCase().includes(q)
      const emailMatch = resource.email?.toLowerCase().includes(q)
      const submitterMatch = resource.suggested_by_email?.toLowerCase().includes(q)
      if (!titleMatch && !descMatch && !addressMatch && !locationMatch && !emailMatch && !submitterMatch) {
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

function confirmAccept(resource: SuggestedResource) {
  suggestionToAccept.value = resource
  feedback.value = null
  acceptDialogOpen.value = true
}

async function handleAccept() {
  if (!suggestionToAccept.value) return
  accepting.value = true
  feedback.value = null

  try {
    const { data, error } = await actions.acceptSuggestedResource({ id: suggestionToAccept.value.suggestion_id })
    if (error) throw error

    if (data?.success) {
      feedback.value = { type: 'success', message: m['moderation.accepted_success']() }
      acceptDialogOpen.value = false
      await getSuggestions()
    }
  } catch (err: any) {
    console.error('[ModerationDashboard] Error accepting suggestion:', err)
    feedback.value = {
      type: 'danger',
      message: err.message || m['moderation.accept_error'](),
    }
    acceptDialogOpen.value = false
  } finally {
    accepting.value = false
    suggestionToAccept.value = null
  }
}

function confirmReject(resource: SuggestedResource) {
  suggestionToReject.value = resource
  feedback.value = null
  rejectDialogOpen.value = true
}

async function handleReject() {
  if (!suggestionToReject.value) return
  rejecting.value = true
  feedback.value = null

  try {
    const { data, error } = await actions.rejectSuggestedResource({ id: suggestionToReject.value.suggestion_id })
    if (error) throw error

    if (data?.success) {
      feedback.value = { type: 'success', message: m['moderation.rejected_success']() }
      rejectDialogOpen.value = false
      await getSuggestions()
    }
  } catch (err: any) {
    console.error('[ModerationDashboard] Error rejecting suggestion:', err)
    feedback.value = {
      type: 'danger',
      message: err.message || m['moderation.reject_error'](),
    }
    rejectDialogOpen.value = false
  } finally {
    rejecting.value = false
    suggestionToReject.value = null
  }
}

async function startEdit(resource: SuggestedResource) {
  editingSuggestion.value = {
    suggestion_id: resource.suggestion_id,
    id: resource.id,
    title: resource.title || '',
    description: resource.description || '',
    typology_id: resource.typology_id || '',
    category_id: resource.category_id || '',
    characteristics_ids: resource.characteristics_ids || [],
    location_name: resource.location || '',
    address: resource.address || '',
    postal_code: resource.postal_code || '',
    email: resource.email || '',
    phone: resource.phone != null ? String(resource.phone) : '',
    phone_area_code: resource.phone_area_code != null ? Number(resource.phone_area_code) : null,
    access: resource.access || '',
    accessibility: resource.accessibility ?? null,
    has_opening_hours: resource.has_opening_hours ?? false,
    opening_hours: resource.opening_hours || null,
    coordinates: {
      latitude: resource.coordinates ? geojson.getLatitude(resource.coordinates) : 0,
      longitude: resource.coordinates ? geojson.getLongitude(resource.coordinates) : 0,
    },
    images: resource.images || [],
    networks: resource.networks || [],
  }

  if (resource.typology_id) {
    await getEditCategories(resource.typology_id)
  } else {
    editCategories.value = []
  }

  editDialogOpen.value = true
}

async function handleEditTypologyChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newTypologyId = target.value || ''
  editingSuggestion.value.typology_id = newTypologyId
  editingSuggestion.value.category_id = ''
  await getEditCategories(newTypologyId)
}

async function handleSaveEdit() {
  if (!editingSuggestion.value) return
  savingEdit.value = true
  feedback.value = null

  try {
    const payload = {
      suggestion_id: editingSuggestion.value.suggestion_id,
      id: editingSuggestion.value.id,
      title: editingSuggestion.value.title,
      description: editingSuggestion.value.description,
      typology_id: editingSuggestion.value.typology_id,
      category_id: editingSuggestion.value.category_id,
      characteristics_ids: editingSuggestion.value.characteristics_ids,
      location_name: editingSuggestion.value.location_name,
      address: editingSuggestion.value.address,
      postal_code: editingSuggestion.value.postal_code,
      email: editingSuggestion.value.email || undefined,
      phone: editingSuggestion.value.phone ? editingSuggestion.value.phone : undefined,
      phone_area_code: editingSuggestion.value.phone_area_code != null ? editingSuggestion.value.phone_area_code : undefined,
      access: editingSuggestion.value.access || undefined,
      accessibility: editingSuggestion.value.accessibility,
      has_opening_hours: editingSuggestion.value.has_opening_hours,
      opening_hours: editingSuggestion.value.has_opening_hours ? editingSuggestion.value.opening_hours : undefined,
      coordinates: editingSuggestion.value.coordinates,
      images: editingSuggestion.value.images,
      networks: editingSuggestion.value.networks,
    }

    const { data, error } = await actions.updateSuggestedResource(payload)
    if (error) throw error

    if (data?.success) {
      feedback.value = { type: 'success', message: m['moderation.edit_success']() }
      editDialogOpen.value = false
      await getSuggestions()
    }
  } catch (err: any) {
    console.error('[ModerationDashboard] Error updating suggestion:', err)
    feedback.value = {
      type: 'danger',
      message: err.message || m['moderation.edit_error'](),
    }
  } finally {
    savingEdit.value = false
  }
}

function showOpeningHours(resource: SuggestedResource) {
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

    <div v-if="filteredSuggestions.length > 0" class="card-container">
      <wa-card v-for="resource in filteredSuggestions" :key="resource.suggestion_id">
        <img
          v-if="resource?.images?.[0]"
          slot="media"
          :src="CONFIG.images_url + 'pin-images/' + resource?.images?.[0].url"
          :alt="resource?.title"
          loading="lazy"
        />

        <div slot="header">
          <div class="suggestion-meta">
            <wa-badge :variant="resource.pin_id ? 'warning' : 'brand'">
              {{ resource.pin_id ? m['moderation.type_edit']() : m['moderation.type_new']() }}
            </wa-badge>
            <span class="submitter-email" :title="resource.suggested_by_email || ''">
              {{ m['moderation.suggested_by']({ email: resource.suggested_by_email || '-' }) }}
            </span>
          </div>
          <h2>{{ resource.title }}</h2>
          <p>{{ resource?.category }} ({{ resource?.typology }})</p>
        </div>

        <ResourceSummary
          :resource="resource"
          :show-header="false"
          :show-description="false"
          :show-networks="false"
          schedule-mode="button"
          @open-schedule="showOpeningHours(resource)"
        />

        <Grid slot="footer" justify="end" gap="s">
          <wa-button size="s" appearance="outlined" @click="startEdit(resource)">
            <wa-icon name="pen"></wa-icon>
            {{ m['moderation.edit']() }}
          </wa-button>
          <wa-button size="s" variant="danger" appearance="outlined" @click="confirmReject(resource)">
            <wa-icon name="ban"></wa-icon>
            {{ m['moderation.reject']() }}
          </wa-button>
          <wa-button size="s" variant="brand" @click="confirmAccept(resource)">
            <wa-icon name="circle-check"></wa-icon>
            {{ m['moderation.accept']() }}
          </wa-button>
        </Grid>
      </wa-card>
    </div>
    <div v-else class="empty-state">
      <p>{{ m['moderation.no_suggestions_found']() }}</p>
    </div>
  </Grid>

  <ConfirmationDialog
    v-model:open="acceptDialogOpen"
    :title="m['moderation.accept_confirm_title']()"
    :confirm-label="m['moderation.accept']()"
    variant="brand"
    :loading="accepting"
    @confirm="handleAccept"
  >
    <p>{{ m['moderation.accept_confirm_msg']({ title: suggestionToAccept?.title || '' }) }}</p>
  </ConfirmationDialog>

  <ConfirmationDialog
    v-model:open="rejectDialogOpen"
    :title="m['moderation.reject_confirm_title']()"
    :confirm-label="m['moderation.reject']()"
    variant="danger"
    :loading="rejecting"
    @confirm="handleReject"
  >
    <p>{{ m['moderation.reject_confirm_msg']({ title: suggestionToReject?.title || '' }) }}</p>
    <p class="u-color-danger"><small>{{ m['resources.cannot_be_undone']() }}</small></p>
  </ConfirmationDialog>

  <!-- Edit Suggestion Dialog -->
  <wa-dialog
    id="edit-suggestion-dialog"
    :label="m['moderation.edit_dialog_title']()"
    :open="editDialogOpen ? '' : null"
    light-dismiss
    @wa-after-hide="editDialogOpen = false"
  >
    <form v-if="editingSuggestion" class="edit-form" @submit.prevent="handleSaveEdit">
      <Grid direction="column" gap="m">
        <wa-input
          :label="m['resources.title_label']()"
          :value="editingSuggestion.title"
          required
          @input="editingSuggestion.title = ($event.target as HTMLInputElement).value"
        ></wa-input>

        <wa-textarea
          :label="m['resources.description_label']()"
          :value="editingSuggestion.description"
          rows="3"
          @input="editingSuggestion.description = ($event.target as HTMLTextAreaElement).value"
        ></wa-textarea>

        <wa-select
          :label="m['map.typology']()"
          :value="editingSuggestion.typology_id"
          required
          @input="handleEditTypologyChange"
        >
          <wa-option v-for="t in typologies" :key="t.id" :value="t.id">
            {{ t.name }}
          </wa-option>
        </wa-select>

        <wa-select
          v-if="editingSuggestion.typology_id"
          :label="m['map.category_label']()"
          :value="editingSuggestion.category_id"
          required
          @input="editingSuggestion.category_id = ($event.target as HTMLSelectElement).value"
        >
          <wa-option v-for="c in editCategories" :key="c.id" :value="c.id">
            {{ c.name }}
          </wa-option>
        </wa-select>

        <wa-input
          :label="m['resources.location_name_label']()"
          :value="editingSuggestion.location_name"
          @input="editingSuggestion.location_name = ($event.target as HTMLInputElement).value"
        ></wa-input>

        <wa-input
          :label="m['resources.address_label']()"
          :value="editingSuggestion.address"
          @input="editingSuggestion.address = ($event.target as HTMLInputElement).value"
        ></wa-input>

        <wa-input
          :label="m['resources.postal_code_label']()"
          :value="editingSuggestion.postal_code"
          @input="editingSuggestion.postal_code = ($event.target as HTMLInputElement).value"
        ></wa-input>

        <wa-input
          type="email"
          label="Email"
          :value="editingSuggestion.email"
          @input="editingSuggestion.email = ($event.target as HTMLInputElement).value"
        ></wa-input>

        <wa-input
          type="tel"
          :label="m['resources.phone_label']()"
          :value="editingSuggestion.phone"
          @input="editingSuggestion.phone = ($event.target as HTMLInputElement).value"
        ></wa-input>

        <wa-select
          :label="m['resources.access_label']()"
          :value="editingSuggestion.access"
          with-clear
          @input="editingSuggestion.access = ($event.target as HTMLSelectElement).value"
          @clear="editingSuggestion.access = ''"
        >
          <wa-option value="public">{{ m['resources.access_public']() }}</wa-option>
          <wa-option value="private">{{ m['resources.access_private']() }}</wa-option>
        </wa-select>
      </Grid>

      <div slot="footer" class="dialog-footer">
        <wa-button appearance="outlined" @click="editDialogOpen = false">
          {{ m['resources.cancel']() }}
        </wa-button>
        <wa-button variant="brand" type="submit" :loading="savingEdit">
          {{ m['resources.save']() }}
        </wa-button>
      </div>
    </form>
  </wa-dialog>

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
  padding-block: var(--wa-space-2xl);
  text-align: center;
  color: var(--wa-color-neutral-70);
}

.suggestion-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--wa-space-s);
  margin-block-end: var(--wa-space-xs);
}

.submitter-email {
  font-size: var(--wa-font-size-xs);
  color: var(--wa-color-neutral-60);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--wa-space-s);
  margin-block-start: var(--wa-space-l);
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

wa-dialog {
  --width: 44rem;
}
</style>

