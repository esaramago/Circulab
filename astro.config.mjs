import { defineConfig, fontProviders } from 'astro/config'
import node from '@astrojs/node'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { paraglideCompilerOptions } from './project.inlang/compile-paraglide.mjs'
import paraglideSettings from './project.inlang/settings.json'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  i18n: {
    defaultLocale: 'pt',
    locales: paraglideSettings.locales,
    routing: {
      prefixDefaultLocale: false 
    }
  },
  vite: {
    plugins: [
      paraglideVitePlugin({
        ...paraglideCompilerOptions,
      }),
    ],
  },
  site: import.meta.env.SITE,
  security: {
    allowedDomains: [
      {hostname: import.meta.env.SITE}
    ]
  },
  fonts: [{
    provider: fontProviders.fontsource(),
    name: 'Roboto',
    cssVariable: '--font-roboto',
  }],
})
