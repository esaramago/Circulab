import { m } from '../paraglide/messages.js'
import paraglideSettings from '../../project.inlang/settings.json'
type MessageFns = typeof m
type Locales = (typeof paraglideSettings.locales)

export type ScopedMessages = {
  [K in keyof MessageFns]: MessageFns[K] extends (
    inputs?: infer I,
    options?: { locale?: Locales },
  ) => infer R
    ? (inputs?: I) => R
    : MessageFns[K]
}

export function createScopedMessages(locale: Locales): ScopedMessages {
  return new Proxy(m, {
    get(target, prop) {
      const value = target[prop as keyof MessageFns]
      if (typeof value !== 'function') return value

      return (inputs = {}) =>
        (value as (inputs?: object, options?: { locale?: Locales }) => unknown)(
          inputs,
          { locale },
        )
    },
  }) as ScopedMessages
}
