/** EWKT for PostGIS geography(Point, 4326) inserts via Supabase/PostgREST */
export function geographyPointEwkt(longitude: number, latitude: number): string {
  return `SRID=4326;POINT(${longitude} ${latitude})`
}
