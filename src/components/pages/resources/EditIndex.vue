<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import DescriptionForm from '@/components/pages/resources/DescriptionForm.vue'
import LocationForm from '@/components/pages/resources/LocationForm.vue'
import ContactsForm from '@/components/pages/resources/ContactsForm.vue'
import '@webawesome/card/card.js'
import '@webawesome/button/button.js'
import '@webawesome/icon/icon.js'
import '@webawesome/dialog/dialog.js'
import '@webawesome/callout/callout.js'
import { ref, onMounted, computed } from 'vue'
import { useStore } from '@nanostores/vue'
import {
  $descriptionDraft,
  $locationDraft,
  $editingResourceId,
  ensureDraftLoaded,
} from '@/stores/addResource'
import { localizeHref } from '@/paraglide/runtime.js'
import { m } from '@/paraglide/messages.js'
import type { Database } from '@/types/supabase'

type typologiesType = Database['public']['Tables']['typologies']['Row'][]

defineProps<{
  typologies: typologiesType | null
}>()

const editingResourceId = useStore($editingResourceId)

const activeModal = ref<'description' | 'location' | 'contacts' | null>(null)
const savedChanges = ref<Set<string>>(new Set())

const descriptionSnapshot = ref<any>(null)
const locationSnapshot = ref<any>(null)

const initialDescriptionBaseline = ref<any>(null)
const initialLocationBaseline = ref<any>(null)

const isMounted = ref(false)

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')
  if (id) {
    await ensureDraftLoaded(id)
  }
  initialDescriptionBaseline.value = JSON.parse(JSON.stringify($descriptionDraft.get()))
  initialLocationBaseline.value = JSON.parse(JSON.stringify($locationDraft.get()))
  isMounted.value = true
})

const detailedChanges = computed(() => {
  const changes: string[] = []
  if (savedChanges.value.size === 0) return changes

  const initDesc = initialDescriptionBaseline.value
  const currDesc = $descriptionDraft.get()
  const initLoc = initialLocationBaseline.value
  const currLoc = $locationDraft.get()

  if (savedChanges.value.has('description') && initDesc) {
    if (currDesc.title !== initDesc.title) changes.push(m['resources.title_label']())
    if (currDesc.description !== initDesc.description) changes.push(m['resources.description_label']())
    if (currDesc.typology_id !== initDesc.typology_id) changes.push(m['map.typology']())
    if (currDesc.category_id !== initDesc.category_id) changes.push(m['map.category_label']())
    if (JSON.stringify(currDesc.characteristics_ids) !== JSON.stringify(initDesc.characteristics_ids)) changes.push(m['map.characteristic_label']())
    if (JSON.stringify(currDesc.images) !== JSON.stringify(initDesc.images)) changes.push(m['resources.images_label']())
  }

  if (savedChanges.value.has('location') && initLoc) {
    if (currLoc.location_name !== initLoc.location_name) changes.push(m['resources.location_name_label']())
    if (currLoc.address !== initLoc.address) changes.push(m['resources.address_label']())
    if (currLoc.postal_code !== initLoc.postal_code) changes.push(m['resources.postal_code_label']())
    if (currLoc.coordinates?.latitude !== initLoc.coordinates?.latitude || currLoc.coordinates?.longitude !== initLoc.coordinates?.longitude) {
      changes.push(m['resources.coordinates']().replace(':', ''))
    }
    if (currLoc.accessibility !== initLoc.accessibility) changes.push(m['resources.accessibility_label']())
  }

  if (savedChanges.value.has('contacts') && initLoc) {
    if (currLoc.email !== initLoc.email) changes.push('Email')
    if (currLoc.phone !== initLoc.phone || currLoc.phone_area_code !== initLoc.phone_area_code) changes.push(m['resources.phone_label']())
    if (JSON.stringify(currLoc.networks) !== JSON.stringify(initLoc.networks)) changes.push(m['resources.channels_heading']())
  }

  return changes
})

function openModal(type: 'description' | 'location' | 'contacts') {
  descriptionSnapshot.value = JSON.parse(JSON.stringify($descriptionDraft.get()))
  locationSnapshot.value = JSON.parse(JSON.stringify($locationDraft.get()))
  activeModal.value = type
}

function handleSaveModal(type: 'description' | 'location' | 'contacts') {
  savedChanges.value.add(type)
  activeModal.value = null
}

function handleCancelModal() {
  if (descriptionSnapshot.value) {
    $descriptionDraft.set(descriptionSnapshot.value)
  }
  if (locationSnapshot.value) {
    $locationDraft.set(locationSnapshot.value)
  }
  activeModal.value = null
}

function handleDialogHide(type: string, event: Event) {
  if (event.target !== event.currentTarget) {
    event.stopPropagation()
    return
  }
  if (activeModal.value === type) {
    handleCancelModal()
  }
}
</script>

<template>
  <Grid gap="xl" direction="column">
    <!-- List of options to edit -->
    <Grid gap="m" direction="column">
      <h3>{{ m['resources.edit_options']() }}</h3>

      <wa-card>
        <Grid justify="space-between" align="center">
          <Grid gap="m" align="center">
            <wa-icon name="pen-to-square" size="l"></wa-icon>
            <div>
              <h4>{{ m['resources.step_description']() }}</h4>
              <p class="u-text-small">
                {{ m['resources.description_option_sub']() }}
              </p>
            </div>
          </Grid>
          <wa-button variant="brand" appearance="outlined" @click="openModal('description')">
            <wa-icon name="pen" slot="start"></wa-icon>
            {{ m['map.edit']() }}
          </wa-button>
        </Grid>
      </wa-card>

      <wa-card>
        <Grid justify="space-between" align="center">
          <Grid gap="m" align="center">
            <wa-icon name="location-dot" size="l"></wa-icon>
            <div>
              <h4>{{ m['resources.step_location']() }}</h4>
              <p class="u-text-small">
                {{ m['resources.location_option_sub']() }}
              </p>
            </div>
          </Grid>
          <wa-button variant="brand" appearance="outlined" @click="openModal('location')">
            <wa-icon name="pen" slot="start"></wa-icon>
            {{ m['map.edit']() }}
          </wa-button>
        </Grid>
      </wa-card>

      <wa-card>
        <Grid justify="space-between" align="center">
          <Grid gap="m" align="center">
            <wa-icon name="address-book" size="l"></wa-icon>
            <div>
              <h4>{{ m['resources.step_contacts']() }}</h4>
              <p class="u-text-small">
                {{ m['resources.contacts_option_sub']() }}
              </p>
            </div>
          </Grid>
          <wa-button variant="brand" appearance="outlined" @click="openModal('contacts')">
            <wa-icon name="pen" slot="start"></wa-icon>
            {{ m['map.edit']() }}
          </wa-button>
        </Grid>
      </wa-card>
    </Grid>

    <!-- List of local changes made -->
    <Grid gap="s" direction="column" v-if="savedChanges.size > 0">
      <wa-callout variant="success">
        <wa-icon slot="icon" name="circle-check"></wa-icon>
        <h3>{{ m['resources.local_changes_title']() }}:</h3>
        <ul class="c-changes-list">
          <li v-for="(changeText, index) in detailedChanges" :key="index">
            {{ changeText }}
          </li>
        </ul>
      </wa-callout>
    </Grid>

    <!-- Continue button -->
    <Grid justify="space-between">
      <wa-button appearance="outlined" :href="localizeHref(`/mapa`)">{{ m['common.back']() }}</wa-button>
      <wa-button
        variant="brand"
        :href="localizeHref(`/recursos/editar/resumo?id=${editingResourceId || ''}`)"
        :disabled="savedChanges.size === 0"
      >
        {{ m['resources.continue']() }}
      </wa-button>
    </Grid>

    <!-- Popup Dialogs -->
    <wa-dialog
      :label="m['resources.edit_description_dialog']()"
      :open="activeModal === 'description' || null"
      @wa-hide="(e: Event) => handleDialogHide('description', e)"
    >
      <DescriptionForm
        v-if="activeModal === 'description'"
        :typologies="typologies"
        :in-modal="true"
        @save="handleSaveModal('description')"
        @cancel="handleCancelModal"
      />
    </wa-dialog>

    <wa-dialog
      :label="m['resources.edit_location_dialog']()"
      :open="activeModal === 'location' || null"
      @wa-hide="(e: Event) => handleDialogHide('location', e)"
    >
      <LocationForm
        v-if="activeModal === 'location'"
        :in-modal="true"
        @save="handleSaveModal('location')"
        @cancel="handleCancelModal"
      />
    </wa-dialog>

    <wa-dialog
      :label="m['resources.edit_contacts_dialog']()"
      :open="activeModal === 'contacts' || null"
      @wa-hide="(e: Event) => handleDialogHide('contacts', e)"
    >
      <ContactsForm
        v-if="activeModal === 'contacts'"
        :in-modal="true"
        @save="handleSaveModal('contacts')"
        @cancel="handleCancelModal"
      />
    </wa-dialog>
  </Grid>
</template>

<style scoped>
wa-dialog {
  --width: 50rem;
}
</style>
