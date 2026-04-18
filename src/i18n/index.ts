import en from './en.json'
import pt from './pt.json'

export type Messages = typeof en

/** Astro `locales` → bundles (ficheiros podem usar nomes mais curtos). */
const byLocale: Record<string, Messages> = {
  en,
  'pt-pt': pt,
}

export function getMessages(locale: string | undefined): Messages {
  if (locale && locale in byLocale) {
    return byLocale[locale]
  }
  return byLocale['pt-pt']
}
