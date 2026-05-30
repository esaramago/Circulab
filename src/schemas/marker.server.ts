import { z } from 'astro/zod'

export const markerSchema = z.object({
  title: z.string(),
  typology_id: z.string(),
  category_id: z.string(),
  characteristics_ids: z.array(z.string()),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  description: z.string().optional(),
  images: z.array(z.object({
    bucket: z.string(),
    path: z.string(),
  })).array().optional(),
  //location_id: z.string(),

  location_name: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  location: z.string().optional(),
  email: z.email().optional(),
  phone: z.number().optional(),
})

export type MarkerType = z.infer<typeof markerSchema>
