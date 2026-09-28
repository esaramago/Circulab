<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { actions } from 'astro:actions'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue'
import { CONFIG } from '@/config'
import '@webawesome/button/button.js'
import '@webawesome/icon/icon.js'
import '@webawesome/callout/callout.js'
import '@webawesome/card/card.js'
import '@webawesome/input/input.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import '@webawesome/badge/badge.js'
import type { SuggestedResource } from '@/types/domain/resource'
import Grid from '@/components/ui/Grid.vue'
import type { TypologyRow, CategoryRow } from '@/types/database'
import { m } from '@/paraglide/messages.js'
import { localizeHref } from '@/paraglide/runtime.js'
import { clearAddResourceDraft } from '@/stores/addResource'
import ResourceSummary from '@/components/pages/resources/ResourceSummary.vue'

const suggestions = ref<SuggestedResource[]>([])
const typologies = ref<TypologyRow[]>([])
const categories = ref<CategoryRow[]>([])

const search = ref('')
const selectedTypology = ref('')
const selectedCategory = ref('')

const acceptDialogOpen = ref(false)
const suggestionToAccept = ref<SuggestedResource | null>(null)
const accepting = ref(false)

const rejectDialogOpen = ref(false)
const suggestionToReject = ref<SuggestedResource | null>(null)
const rejecting = ref(false)

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
        />

        <Grid slot="footer" justify="end" gap="s">
          <wa-button
            size="s"
            :href="localizeHref(`/recursos/editar?suggestion_id=${resource.suggestion_id}`)"
            @click="clearAddResourceDraft"
          >
            <wa-icon name="pen"></wa-icon>
            {{ m['moderation.edit']() }}
          </wa-button>
          <wa-button size="s" variant="danger" @click="confirmReject(resource)">
            <wa-icon name="ban"></wa-icon>
            {{ m['moderation.reject']() }}
          </wa-button>
          <wa-button size="s" variant="success" @click="confirmAccept(resource)">
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

