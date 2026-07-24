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
import { actions } from 'astro:actions'
import geojson from '@/utils/geojson'
import { CONFIG } from '@/config'

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

export const $editingResourceId = persistentJSON<string | null>(
  `${STORAGE_PREFIX}:editingResourceId`,
  null
)

const STEP_COMPLETED_KEYS: Record<AddResourceStepCode, string> = {
  description: `${STORAGE_PREFIX}:description:completed`,
  location: `${STORAGE_PREFIX}:location:completed`,
  contacts: `${STORAGE_PREFIX}:contacts:completed`,
  summary: `${STORAGE_PREFIX}:summary:completed`,
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

export async function ensureDraftLoaded(id: string) {
  if ($editingResourceId.get() === id) {
    return // Already loaded
  }

  const { data, error } = await actions.getResource({ id })
  console.log('[Store] ensureDraftLoaded data:', data)
  if (error || !data) {
    console.error('[Store] Failed to load resource draft:', error)
    return
  }

  // Populate description draft
  const dbImages = (data.images as { url: string; alt?: string }[]) || []
  const draftImages = dbImages.map((img) => ({
    id: img.url, // Store the relative path in the id
    url: img.url.startsWith('http') ? img.url : `${CONFIG.images_url}pin-images/${img.url}`, // Display public URL
    alt: img.alt || '',
  }))

  $descriptionDraft.set({
    title: data.title || '',
    description: data.description || '',
    typology_id: data.typology_id || null,
    category_id: data.category_id || null,
    characteristics_ids: data.characteristics_ids || [],
    images: draftImages,
  })

  // Populate location draft
  $locationDraft.set({
    location_name: data.location || '',
    address: data.address || '',
    postal_code: data.postal_code || '',
    coordinates: {
      latitude: data.coordinates ? geojson.getLatitude(data.coordinates) : 0,
      longitude: data.coordinates ? geojson.getLongitude(data.coordinates) : 0,
    },
    accessibility: 'public',
    opening_days: [],
    opening_hours: {},
    email: data.email || '',
    phone: data.phone ? Number(data.phone) : null,
    phone_area_code: data.phone_area_code ? Number(data.phone_area_code) : null,
    website: '',
    instagram: '',
    facebook: '',
    networks: [],
  })

  // Set the editing ID
  $editingResourceId.set(id)

  // Mark steps as completed
  setStepCompleted('validation', true)
  setStepCompleted('description', true)
  setStepCompleted('location', true)
  setStepCompleted('contacts', true)
  setStepCompleted('summary', true)
}

export function clearAddResourceDraft() {
  $descriptionDraft.set(initialDescriptionDraft)
  $locationDraft.set(initialLocationDraft)
  $validationDraft.set(initialValidationDraft)
  $editingResourceId.set(null)

  for (const key of Object.values(STEP_COMPLETED_KEYS)) {
    window.localStorage.removeItem(key)
  }
  window.localStorage.removeItem(`${STORAGE_PREFIX}:editingResourceId`)
}
