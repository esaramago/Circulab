import { atom } from 'nanostores'
import type { MapLayer } from '@/types'

const basemapsApiKey = import.meta.env.PUBLIC_BASEMAPS_API_KEY || import.meta.env.BASEMAPS_API_KEY

export const MAP_LAYERS: MapLayer[] = [
  {
    id: 'voyager',
    name: 'Default map',
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${basemapsApiKey}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  },
  {
    id: 'cartodb-positron',
    name: 'Positron',
    url: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${basemapsApiKey}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	  subdomains: 'abcd',
  },
  {
    id: 'satellite',
    name: 'Vista satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
]

export const $selectedLayerId = atom<string>('voyager')

export function selectLayer(layerId: string) {
  if (MAP_LAYERS.some(l => l.id === layerId)) {
    $selectedLayerId.set(layerId)
  }
}

export interface MapFiltersState {
  typology: string | null
  category: string | null
  characteristics: string[] | null
  search: string | null
}

export const initialMapFilters: MapFiltersState = {
  typology: null,
  category: null,
  characteristics: null,
  search: null
}

export const $mapFilters = atom<MapFiltersState>(initialMapFilters)

export function setMapFilters(filters: Partial<MapFiltersState>) {
  $mapFilters.set({
    ...$mapFilters.get(),
    ...filters
  })
}

export function resetMapFilters() {
  $mapFilters.set({ ...initialMapFilters })
}

