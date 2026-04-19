import { defineConfig, fontProviders } from 'astro/config'
import node from '@astrojs/node'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import {
  paraglideUrlPatterns,
} from './project.inlang/paraglide.shared.mjs'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    plugins: [
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/paraglide',
        strategy: [
          'url',
          'cookie',
          'preferredLanguage',
          'baseLocale',
        ],
        urlPatterns: paraglideUrlPatterns,
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
