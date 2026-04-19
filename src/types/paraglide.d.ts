/** Bridges the `@/` alias to generated Paraglide output so TS resolves despite `src/paraglide/.gitignore`. */
declare module '@/paraglide/messages.js' {
  export * from '../paraglide/messages/_index.js'
  export * as m from '../paraglide/messages/_index.js'
}

/** Minimal typings for Paraglide runtime helpers (generated JS may be hidden from the TS server). */
declare module '@/paraglide/runtime.js' {
  export function localizeHref(
    href: string,
    options?: { locale?: 'en' | 'pt' },
  ): string
  export function deLocalizeHref(href: string): string
}