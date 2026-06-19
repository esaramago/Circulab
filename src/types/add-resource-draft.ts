export type DescriptionImageDraft = {
  id: string
  url: string
  alt: string
}

export type DescriptionDraft = {
  title: string | null
  description: string | null
  typology_id: string | null
  category_id: string | null
  characteristics_ids: string[]
  images: DescriptionImageDraft[]
}

export type LocationDraft = {
  location_name: string
  address: string
  postal_code: string
  latitude: number | undefined
  longitude: number | undefined
  accessibility: '' | 'public' | 'private'
  opening_days: string[]
  opening_hours: Record<string, { start: string, end: string }>
  email: string
  phone: number | null
  phone_area_code: number | null
  website: string
  instagram: string
  facebook: string
  networks: string[]
}

export type ValidationDraft = {
  exists: boolean
  permanent: boolean
  notRepeated: boolean
}

export type AddResourceStepCode = 'description' | 'location' | 'validation'

export const initialDescriptionDraft: DescriptionDraft = {
  title: null,
  description: null,
  typology_id: null,
  category_id: null,
  characteristics_ids: [],
  images: [],
}

export const initialLocationDraft: LocationDraft = {
  location_name: '',
  address: '',
  postal_code: '',
  latitude: undefined,
  longitude: undefined,
  accessibility: '',
  opening_days: [],
  opening_hours: {},
  email: '',
  phone: null,
  phone_area_code: null,
  website: '',
  instagram: '',
  facebook: '',
  networks: [],
}

export const initialValidationDraft: ValidationDraft = {
  exists: false,
  permanent: false,
  notRepeated: false,
}
