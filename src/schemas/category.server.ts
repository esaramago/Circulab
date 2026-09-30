import { z } from 'astro/zod'

const i18nRequiredName = z.union([
  z.object({
    pt: z.string().min(1, 'Nome em português é obrigatório'),
    en: z.string().min(1, 'Nome em inglês é obrigatório'),
  }).transform((val) => ({
    pt: val.pt.trim(),
    en: val.en.trim(),
  })),
  z.string().min(1, 'Nome é obrigatório').transform((val) => ({ pt: val.trim(), en: val.trim() }))
])

const i18nOptionalDescription = z.union([
  z.string().transform((val) => {
    const trimmed = val.trim()
    return trimmed ? { pt: trimmed } : null
  }),
  z.object({
    pt: z.string().optional().nullable(),
    en: z.string().optional().nullable(),
  }).transform((val) => {
    const res: Record<string, string> = {}
    if (val.pt && val.pt.trim()) res.pt = val.pt.trim()
    if (val.en && val.en.trim()) res.en = val.en.trim()
    return Object.keys(res).length > 0 ? res : null
  })
]).optional().nullable()

export const categorySchema = z.object({
  id: z.string().optional(),
  name: i18nRequiredName,
  description: i18nOptionalDescription,
  typology_id: z.string().min(1, 'Tipologia é obrigatória'),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
})
