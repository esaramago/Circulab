/** Bridges the `@/` alias to generated Paraglide output so TS resolves despite `src/paraglide/.gitignore`. */
declare module '@/paraglide/messages.js' {
  export * from '../paraglide/messages/_index.js'
  export * as m from '../paraglide/messages/_index.js'
}
