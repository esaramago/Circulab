import { getLocale, baseLocale } from '@/paraglide/runtime.js'
import type { I18nText } from '@/types/database'

/**
 * Returns the localized text from an I18nText JSONB object or fallback string.
 * Priority: requested locale -> base locale ('pt') -> first available value -> empty string.
 */
export function i18nDb(
  field: I18nText | string | null | undefined,
  locale?: string
): string {
  if (!field) return ''

  let target: any = field
  if (typeof target === 'string') {
    const trimmed = target.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (typeof parsed === 'object' && parsed !== null) {
          target = parsed
        } else {
          return target
        }
      } catch {
        return target
      }
    } else {
      return target
    }
  }

  if (typeof target !== 'object') return ''

  let targetLocale = locale
  if (!targetLocale) {
    try {
      targetLocale = getLocale()
    } catch {
      targetLocale = baseLocale || 'pt'
    }
  }

  if (targetLocale && target[targetLocale]) {
    return target[targetLocale] as string
  }

  if (target.pt) {
    return target.pt
  }

  const values = Object.values(target).filter((val): val is string => typeof val === 'string' && val.length > 0)
  return values[0] || ''
}

/**
 * Helper to ensure a value is converted to a valid I18nText object.
 */
export function toI18nText(
  value: I18nText | string | null | undefined,
  defaultLocale = 'pt'
): I18nText {
  if (!value) {
    return { [defaultLocale]: '', en: '' } as unknown as I18nText
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed as I18nText
        }
      } catch {}
    }
    return { [defaultLocale]: value, en: '' } as unknown as I18nText
  }
  return value
}

