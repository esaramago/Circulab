<script setup lang="ts">
import { computed } from 'vue'
import '@webawesome/button/button.js'
import '@webawesome/icon/icon.js'
import { m } from '@/paraglide/messages.js'
import { WEEK_DAYS, type WeekDay, type DaySchedule, type WeekSchedule } from '@/types/add-resource-draft'

const props = withDefaults(
  defineProps<{
    openingHours?: WeekSchedule | Record<string, DaySchedule> | null
    isEditable?: boolean
  }>(),
  {
    openingHours: () => ({}),
    isEditable: false,
  }
)

const emit = defineEmits<{
  (e: 'edit', dayKey: WeekDay): void
}>()

function getDaySchedule(dayKey: WeekDay): DaySchedule {
  const current = props.openingHours?.[dayKey]
  if (current && typeof current.isOpen === 'boolean') {
    return current
  }
  return {
    isOpen: false,
    periods: [],
  }
}

const daysList = computed(() => {
  const dayNames: Record<WeekDay, string> = {
    sunday: m['days.sunday'](),
    monday: m['days.monday'](),
    tuesday: m['days.tuesday'](),
    wednesday: m['days.wednesday'](),
    thursday: m['days.thursday'](),
    friday: m['days.friday'](),
    saturday: m['days.saturday'](),
  }

  return WEEK_DAYS.map((key) => ({
    key,
    name: dayNames[key] || key,
    schedule: getDaySchedule(key),
  }))
})
</script>

<template>
  <table class="schedule">
    <tr
      v-for="day in daysList"
      :key="day.key"
    >
      <td>{{ day.name }}</td>

      <td class="u-text-end">
        <template v-if="day.schedule.isOpen && day.schedule.periods.length > 0">
          <div
            v-for="(period, idx) in day.schedule.periods"
            :key="idx"
          >
            {{ period.start }}–{{ period.end }}
          </div>
        </template>
        <span v-else>
          {{ m['resources.closed']() }}
        </span>
      </td>

      <td v-if="isEditable">
        <wa-button
          size="s"
          variant="neutral"
          appearance="plain"
          :title="`${m['resources.edit_schedule_dialog']()} - ${day.name}`"
          @click="emit('edit', day.key)"
        >
          <wa-icon name="pen"></wa-icon>
        </wa-button>
      </td>
    </tr>
  </table>
</template>

<style scoped>
.schedule {
  max-width: 45rem;
  td {
    padding: var(--wa-space-xs) var(--wa-space-s);
  }
}
</style>

