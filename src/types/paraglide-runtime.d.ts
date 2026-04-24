/** Minimal typings for Paraglide runtime helpers (generated JS may be hidden from the TS server). */
import type { Locales } from '@inlang/paraglide-js'
declare module '@/paraglide/runtime.js' {
  export function localizeHref(
    href: string,
    options?: { locale?: Locales },
  ): string
  export function deLocalizeHref(href: string): string
  export function setLocale(
    locale: Locales,
    options?: { reload?: boolean },
  ): void
}
