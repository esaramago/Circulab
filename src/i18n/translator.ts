import { m } from '../paraglide/messages.js'

type Locale = 'en' | 'pt'
type MessageFns = typeof m

export type ScopedMessages = {
  [K in keyof MessageFns]: MessageFns[K] extends (
    inputs?: infer I,
    options?: { locale?: Locale },
  ) => infer R
    ? (inputs?: I) => R
    : MessageFns[K]
}

export function createScopedMessages(locale: Locale): ScopedMessages {
  return new Proxy(m, {
    get(target, prop) {
      const value = target[prop as keyof MessageFns]
      if (typeof value !== 'function') return value

      return (inputs = {}) =>
        (value as (inputs?: object, options?: { locale?: Locale }) => unknown)(
          inputs,
          { locale },
        )
    },
  }) as ScopedMessages
}
