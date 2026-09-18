<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ResourceSummaryData } from '@/types/domain/resource'
import Grid from '@/components/ui/Grid.vue'
import OpeningHoursTable from '@/components/pages/resources/OpeningHoursTable.vue'
import { m } from '@/paraglide/messages.js'
import '@webawesome/icon/icon.js'
import '@webawesome/dialog/dialog.js'

interface Props {
  resource: ResourceSummaryData | null
  showHeader?: boolean
  showDescription?: boolean
  showNetworks?: boolean
  showSchedule?: boolean
  scheduleMode?: 'dialog' | 'none' | 'table' | 'button'
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showDescription: true,
  showNetworks: true,
  showSchedule: true,
  scheduleMode: 'dialog'
})

const emit = defineEmits<{
  (e: 'open-schedule'): void
}>()

const isScheduleDialogOpen = ref(false)

const shouldShowSchedule = computed(() => {
  if (!props.showSchedule) return false
  if (props.scheduleMode === 'none') return false
  return Boolean(props.resource?.has_opening_hours)
})

function handleOpenSchedule() {
  isScheduleDialogOpen.value = true
  emit('open-schedule')
}

const coordinates = computed(() => {
  if (!props.resource?.coordinates) return null
  const coords = props.resource.coordinates
  if ('latitude' in coords && 'longitude' in coords) {
    if (coords.latitude == null || coords.longitude == null) return null
    return {
      latitude: coords.latitude,
      longitude: coords.longitude
    }
  }
  if ('coordinates' in coords && Array.isArray(coords.coordinates) && coords.coordinates.length >= 2) {
    return {
      latitude: coords.coordinates[1],
      longitude: coords.coordinates[0]
    }
  }
  return null
})

const locationName = computed(() => {
  return props.resource?.location_name || props.resource?.location || ''
})

const formattedPhone = computed(() => {
  if (!props.resource?.phone) return ''
  if (props.resource.phone_area_code) {
    return `+${props.resource.phone_area_code} ${props.resource.phone}`
  }
  return `${props.resource.phone}`
})

const gMapsURL = computed(() => {
  if (!coordinates.value || !props.resource) return undefined

  if (props.resource?.title) {
    const encondedName = encodeURIComponent(props.resource.title)
    return `https://maps.google.com/?q=${encondedName}&ll=${coordinates.value.latitude},${coordinates.value.longitude}`
  }
})

const telURL = computed(() => {
  if (!props.resource?.phone) return undefined
  if (props.resource.phone_area_code) {
    return `tel:+${props.resource.phone_area_code}${props.resource.phone}`
  }
  return `tel:${props.resource.phone}`
})
</script>

<template>
  <Grid v-if="resource" gap="l" direction="column" class="resource-summary">
    <slot name="header" :resource="resource">
      <div v-if="showHeader" class="resource-summary__header">
        <h2 v-if="resource.title">{{ resource.title }}</h2>
        <p v-if="resource.category || resource.typology">
          <template v-if="resource.category">{{ resource.category }}</template>
          <template v-if="resource.typology"> ({{ resource.typology }})</template>
        </p>
        <p v-if="resource.characteristics">{{ resource.characteristics }}</p>
      </div>
    </slot>

    <Grid gap="xs" direction="column" class="resource-summary__list">
      <Grid gap="xs" align="center" v-if="(locationName || resource.address || resource.postal_code) && coordinates">
        <wa-icon name="location-dot"></wa-icon>
        <div>
          <a :href="gMapsURL" target="_blank" :title="m['map.open_google_maps']()">
            <template v-if="locationName">{{ locationName }}, </template>
            <template v-if="resource.address">{{ resource.address }}, </template>
            <template v-if="resource.postal_code">{{ resource.postal_code }}</template>
          </a>
          <p class="u-text-small">{{ coordinates.latitude }}, {{ coordinates.longitude }}</p>
        </div>
      </Grid>

      <Grid gap="xs" align="center" v-if="resource.email">
        <wa-icon name="at"></wa-icon>
        <a :href="`mailto:${resource.email}`" target="_blank">{{ resource.email }}</a>
      </Grid>

      <Grid gap="xs" align="center" v-if="resource.phone">
        <wa-icon name="phone"></wa-icon>
        <a :href="telURL">{{ formattedPhone }}</a>
      </Grid>


      <template v-if="showNetworks && resource.networks && resource.networks.length > 0">
        <Grid gap="xs" align="center" v-for="net in resource.networks" :key="net.slug">
          <wa-icon :name="net.icon || 'link'" :family="net.icon === 'instagram' || net.icon === 'facebook' ? 'brands' : undefined"></wa-icon>
          <a :href="net.value" target="_blank" rel="noopener noreferrer">{{ net.value }}</a>
        </Grid>
      </template>

      <Grid gap="xs" align="center" v-if="resource.access">
        <template v-if="resource.access === 'private'">
          <wa-icon name="door-closed" size="sm" class="u-color-danger"></wa-icon>
          <span :title="m['map.access_limited_title']()">{{ m['map.access_limited']() }}</span>
        </template>
        <template v-else-if="resource.access === 'public'">
          <wa-icon name="door-open" size="sm" class="u-color-success"></wa-icon>
          <span :title="m['map.access_public_title']()">{{ m['map.access_public']() }}</span>
        </template>
      </Grid>

      <Grid gap="xs" align="center" v-if="resource.accessibility !== null && resource.accessibility !== undefined">
        <template v-if="resource.accessibility">
          <wa-icon name="wheelchair" size="sm" class="u-color-success"></wa-icon>
          <span>{{ m['map.accessibility_accessible']() }}</span>
        </template>
        <template v-else>
          <wa-icon name="wheelchair" size="sm" class="u-color-danger"></wa-icon>
          <span>{{ m['map.accessibility_not_accessible']() }}</span>
        </template>
      </Grid>

      <Grid gap="xs" align="center" v-if="shouldShowSchedule">
        <wa-icon name="clock"></wa-icon>
        <button
          type="button"
          class="c-link"
          @click="handleOpenSchedule"
        >
          {{ m['resources.schedule_heading']() }}
        </button>
      </Grid>
    </Grid>

    <wa-dialog
      v-if="shouldShowSchedule"
      :label="m['resources.schedule_heading']()"
      :open="isScheduleDialogOpen || null"
      light-dismiss
      @wa-after-hide="isScheduleDialogOpen = false"
    >
      <OpeningHoursTable :opening-hours="resource.opening_hours" />
    </wa-dialog>

    <slot name="description" :description="resource.description">
      <div v-if="showDescription && resource.description" class="resource-summary__description">
        <strong>{{ m['resources.description_label']() }}</strong>
        <p>{{ resource.description }}</p>
      </div>
    </slot>
  </Grid>
</template>

