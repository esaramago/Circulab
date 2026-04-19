/** Minimal typings for Paraglide runtime helpers (generated JS may be hidden from the TS server). */
declare module '@/paraglide/runtime.js' {
  export function localizeHref(
    href: string,
    options?: { locale?: 'en' | 'pt' },
  ): string
  export function deLocalizeHref(href: string): string
  export function setLocale(
    locale: 'en' | 'pt',
    options?: { reload?: boolean },
  ): void
}
