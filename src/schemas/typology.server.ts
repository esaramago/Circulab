import { z } from 'astro/zod'

export const updateTypologySchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  has_category_color: z.boolean().optional(),
})
