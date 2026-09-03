import { z } from 'astro/zod'

export const resourceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  typology_id: z.string(),
  category_id: z.string(),
  characteristics_ids: z.array(z.string()),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  description: z.string().optional(),
  images: z.array(
    z.object({
      url: z.string(),
      alt: z.string().optional(),
    })
  ).optional(),
  //location_id: z.string(),

  location_name: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.number().optional(),
  phone_area_code: z.number().optional(),
  accessibility: z.string(),
  has_opening_hours: z.boolean().optional(),
  opening_hours: z.record(z.string(), z.any()).optional().nullable(),
  networks: z.array(
    z.object({
      slug: z.string(),
      value: z.string()
    })
  ).optional()
})

export type ResourceType = z.infer<typeof resourceSchema>