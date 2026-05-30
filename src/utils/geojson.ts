import type { GeoJsonPoint, Json } from '@/types/database'

export default {
  getLatitude: (geojson: GeoJsonPoint | Json) => {
    return (geojson as GeoJsonPoint).coordinates[1]
  },
  getLongitude: (geojson: GeoJsonPoint | Json) => {
    return (geojson as GeoJsonPoint).coordinates[0]
  }
}
