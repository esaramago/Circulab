import { persistentJSON } from '@nanostores/persistent'
import type {
  AddResourceStepCode,
  DescriptionDraft,
  LocationDraft,
  ValidationDraft,
} from '@/types/add-resource-draft'
import {
  initialDescriptionDraft,
  initialLocationDraft,
  initialValidationDraft,
} from '@/types/add-resource-draft'

const STORAGE_PREFIX = 'circulab:add'

export const $descriptionDraft = persistentJSON<DescriptionDraft>(
  `${STORAGE_PREFIX}:description`,
  initialDescriptionDraft
)

export const $locationDraft = persistentJSON<LocationDraft>(
  `${STORAGE_PREFIX}:location`,
  initialLocationDraft
)

export const $validationDraft = persistentJSON<ValidationDraft>(
  `${STORAGE_PREFIX}:validation`,
  initialValidationDraft
)

const STEP_COMPLETED_KEYS: Record<AddResourceStepCode, string> = {
  description: `${STORAGE_PREFIX}:description:completed`,
  location: `${STORAGE_PREFIX}:location:completed`,
  validation: `${STORAGE_PREFIX}:validation:completed`,
}

export function setStepCompleted(code: AddResourceStepCode, completed: boolean) {
  const key = STEP_COMPLETED_KEYS[code]

  if (code === 'validation') {
    window.localStorage.setItem(key, completed ? 'true' : 'false')
    return
  }

  if (completed) {
    window.localStorage.setItem(key, 'true')
  } else {
    window.localStorage.removeItem(key)
  }
}

export function isStepCompleted(code: AddResourceStepCode): boolean {
  return window.localStorage.getItem(STEP_COMPLETED_KEYS[code]) === 'true'
}

export function getAddResourcePayload() {
  return {
    ...$descriptionDraft.get(),
    ...$locationDraft.get(),
  }
}

export function clearAddResourceDraft() {
  $descriptionDraft.set(initialDescriptionDraft)
  $locationDraft.set(initialLocationDraft)
  $validationDraft.set(initialValidationDraft)

  for (const key of Object.values(STEP_COMPLETED_KEYS)) {
    window.localStorage.removeItem(key)
  }
}
