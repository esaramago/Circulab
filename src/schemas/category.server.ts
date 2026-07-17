import { z } from 'astro/zod'

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().nullable(),
  typology_id: z.string().min(1, 'Tipologia é obrigatória'),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
})
