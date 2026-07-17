import { atom } from 'nanostores'
import type { MapLayer } from '@/types'

export const MAP_LAYERS: MapLayer[] = [
  {
    id: 'voyager',
    name: 'Default map',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
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
