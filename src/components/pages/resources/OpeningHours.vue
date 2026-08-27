<script setup lang="ts">
import { ref, computed } from 'vue'
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/switch/switch.js'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import '@webawesome/icon/icon.js'
import '@webawesome/dialog/dialog.js'
import '@webawesome/checkbox/checkbox.js'
import { m } from '@/paraglide/messages.js'
import { WEEK_DAYS, type WeekDay, type DaySchedule, type TimePeriod, type WeekSchedule } from '@/types/add-resource-draft'
import OpeningHoursTable from '@/components/pages/resources/OpeningHoursTable.vue'

const props = withDefaults(
  defineProps<{
    hasOpeningHours?: boolean
    modelValue?: WeekSchedule | Record<string, DaySchedule>
  }>(),
  {
    hasOpeningHours: false,
    modelValue: () => ({}),
  }
)

const emit = defineEmits<{
  (e: 'update:hasOpeningHours', value: boolean): void
  (e: 'update:modelValue', value: WeekSchedule): void
  (e: 'change', value: WeekSchedule): void
}>()

const isDialogOpen = ref(false)
const selectedDayKey = ref<WeekDay | null>(null)
const editingIsOpen = ref(false)
const editingPeriods = ref<TimePeriod[]>([])
const applyToWeekdays = ref(false)
const applyToAllDays = ref(false)

const selectedDayName = computed(() => {
  if (!selectedDayKey.value) return ''
  const dayNames: Record<WeekDay, string> = {
    sunday: m['days.sunday'](),
    monday: m['days.monday'](),
    tuesday: m['days.tuesday'](),
    wednesday: m['days.wednesday'](),
    thursday: m['days.thursday'](),
    friday: m['days.friday'](),
    saturday: m['days.saturday'](),
  }
  return dayNames[selectedDayKey.value] || ''
})

const isCurrentDayWeekday = computed(() => {
  return selectedDayKey.value !== 'sunday' && selectedDayKey.value !== 'saturday'
})

function getDaySchedule(dayKey: WeekDay): DaySchedule {
  const current = props.modelValue?.[dayKey]
  if (current && typeof current.isOpen === 'boolean') {
    return current
  }
  return {
    isOpen: false,
    periods: [],
  }
}

function handleToggleHasOpeningHours(event: Event) {
  const target = event.target as any
  const enabled = !!target.checked
  emit('update:hasOpeningHours', enabled)
}

function openEditDialog(dayKey: WeekDay) {
  selectedDayKey.value = dayKey
  const current = getDaySchedule(dayKey)
  editingIsOpen.value = current.isOpen
  editingPeriods.value = current.periods?.length > 0
    ? current.periods.map((p) => ({ ...p }))
    : [{ start: '09:00', end: '18:00' }]
  applyToWeekdays.value = false
  applyToAllDays.value = false
  isDialogOpen.value = true
}

function handleToggleOpen(event: Event) {
  const target = event.target as any
  editingIsOpen.value = !!target.checked
  if (editingIsOpen.value && editingPeriods.value.length === 0) {
    editingPeriods.value = [{ start: '09:00', end: '18:00' }]
  }
}

function addPeriod() {
  const lastPeriod = editingPeriods.value[editingPeriods.value.length - 1]
  const newStart = lastPeriod?.end || '14:00'
  editingPeriods.value.push({ start: newStart, end: '18:00' })
}

function removePeriod(index: number) {
  editingPeriods.value.splice(index, 1)
  if (editingPeriods.value.length === 0) {
    editingIsOpen.value = false
  }
}

function handleSaveDaySchedule() {
  if (!selectedDayKey.value) return

  const updated: WeekSchedule = {
    sunday: getDaySchedule('sunday'),
    monday: getDaySchedule('monday'),
    tuesday: getDaySchedule('tuesday'),
    wednesday: getDaySchedule('wednesday'),
    thursday: getDaySchedule('thursday'),
    friday: getDaySchedule('friday'),
    saturday: getDaySchedule('saturday'),
    ...(props.modelValue || {}),
  }

  const validPeriods = editingIsOpen.value
    ? editingPeriods.value.filter((p) => p.start && p.end)
    : []

  const newSchedule: DaySchedule = {
    isOpen: editingIsOpen.value && validPeriods.length > 0,
    periods: validPeriods,
  }

  if (applyToAllDays.value) {
    WEEK_DAYS.forEach((k) => {
      updated[k] = JSON.parse(JSON.stringify(newSchedule))
    })
  } else if (applyToWeekdays.value) {
    const weekdays: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    weekdays.forEach((k) => {
      updated[k] = JSON.parse(JSON.stringify(newSchedule))
    })
    updated[selectedDayKey.value] = newSchedule
  } else {
    updated[selectedDayKey.value] = newSchedule
  }

  emit('update:modelValue', updated)
  emit('change', updated)
  isDialogOpen.value = false
}

function handleDialogHide(event: Event) {
  if (event.target !== event.currentTarget) {
    event.stopPropagation()
    return
  }
  isDialogOpen.value = false
}
</script>

<template>
  <Grid direction="column">
    <h3>{{ m['resources.schedule_heading']() }}</h3>
    <wa-switch
      :checked="hasOpeningHours || null"
      @change="handleToggleHasOpeningHours"
    >{{ m['resources.schedule_switch_label']() }}</wa-switch>

    <OpeningHoursTable
      v-if="hasOpeningHours"
      :opening-hours="modelValue"
      :is-editable="true"
      @edit="openEditDialog"
    />
  </Grid>

  <wa-dialog
    :label="`${m['resources.edit_schedule_dialog']()} - ${selectedDayName}`"
    :open="isDialogOpen || null"
    @wa-hide="handleDialogHide"
  >
    <Grid gap="l" direction="column">
      <wa-switch
        :checked="editingIsOpen || null"
        @change="handleToggleOpen"
      >
        {{ editingIsOpen ? m['resources.open']() : m['resources.closed']() }}
      </wa-switch>

      <Grid v-if="editingIsOpen" gap="l" direction="column">
        <Grid gap="s" direction="column">
          <Grid
            v-for="(period, index) in editingPeriods"
            :key="index"
            gap="s"
            align="center"
          >
            <wa-input
              type="time"
              :label="m['resources.start_time']()"
              :value="period.start"
              @input="period.start = ($event.target as HTMLInputElement).value"
              required
            ></wa-input>

            <wa-input
              type="time"
              :label="m['resources.end_time']()"
              :value="period.end"
              @input="period.end = ($event.target as HTMLInputElement).value"
              required
            ></wa-input>

            <wa-button
              v-if="editingPeriods.length > 1"
              variant="neutral"
              appearance="plain"
              :title="m['resources.remove_period']()"
              @click="removePeriod(index)"
            >
              <wa-icon name="trash"></wa-icon>
            </wa-button>
          </Grid>
        </Grid>
        <div>
          <wa-button
            size="s"
            variant="brand"
            appearance="outlined"
            @click="addPeriod"
          >
            <wa-icon name="plus" slot="start"></wa-icon>
            {{ m['resources.add_period']() }}
          </wa-button>
        </div>

        <Grid gap="xs" direction="column">
          <wa-checkbox
            v-if="isCurrentDayWeekday"
            :checked="applyToWeekdays || null"
            @change="applyToWeekdays = ($event.target as any).checked"
          >
            {{ m['resources.apply_to_weekdays']() }}
          </wa-checkbox>
          <wa-checkbox
            :checked="applyToAllDays || null"
            @change="applyToAllDays = ($event.target as any).checked"
          >
            {{ m['resources.apply_to_all_days']() }}
          </wa-checkbox>
        </Grid>
      </Grid>
    </Grid>

    <Grid slot="footer" gap="s">
      <wa-button variant="neutral" @click="isDialogOpen = false">{{ m['resources.cancel']() }}</wa-button>
      <wa-button variant="brand" @click="handleSaveDaySchedule">{{ m['resources.save']() }}</wa-button>
    </Grid>
  </wa-dialog>
</template>

<style scoped>
wa-dialog {
  --width: 35rem;
}
</style>