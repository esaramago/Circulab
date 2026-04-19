/**
 * Single source of Paraglide compiler options (CLI + Vite).
 *
 * @see https://inlang.com/m/gerre34r/library-inlang-paraglideJs/strategy
 */

export const paraglideStrategy = [
  'url',
  'preferredLanguage',
  'baseLocale',
]

const basePath = ':protocol://:domain(.*)::port?/'

const routes = [
  {
    en: 'about',
    pt: 'sobre',
  },
  {
    en: 'contacts',
    pt: 'contactos',
  },
]

export const paraglideUrlPatterns = [
  ...routes.map(route => buildUrlPattern(route)),
  {
    pattern: `${basePath}:path(.*)?`,
    localized: [
      ['en', `${basePath}en/:path(.*)?`],
      ['pt', `${basePath}:path(.*)?`],
    ],
  },
]

/** Shared options between `paraglideVitePlugin` and `compile()` (except project/outdir). */
export const paraglideCompilerOptions = {
  strategy: paraglideStrategy,
  urlPatterns: paraglideUrlPatterns,
}



function buildUrlPattern(route) {
  return {
    pattern: `${basePath}${route.en}`,
    localized: [
      ['en', `${basePath}en/${route.en}`],
      ['pt', `${basePath}${route.pt}`],
    ],
  }
}