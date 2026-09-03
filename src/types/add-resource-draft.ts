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

export type TimePeriod = {
  start: string
  end: string
}

export type DaySchedule = {
  isOpen: boolean
  periods: TimePeriod[]
}

export type WeekSchedule = Record<string, DaySchedule>

export const WEEK_DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export type WeekDay = typeof WEEK_DAYS[number]

export type LocationDraft = {
  location_name: string
  address: string
  postal_code: string
  coordinates: {
    latitude: number
    longitude: number
  }
  accessibility: '' | 'public' | 'private'
  has_opening_hours: boolean
  opening_days: string[]
  opening_hours: Record<string, DaySchedule>
  email: string
  phone: number | null
  phone_area_code: number | null
  website: string
  instagram: string
  facebook: string
  networks: { slug: string; name: string; value: string; icon?: string | null }[]
}

export type ValidationDraft = {
  exists: boolean
  permanent: boolean
  notRepeated: boolean
}

export type AddResourceStepCode = 'description' | 'location' | 'contacts' | 'summary' | 'validation'

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
  coordinates: {
    latitude: 0,
    longitude: 0,
  },
  accessibility: '',
  has_opening_hours: false,
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
