import { defineConfig, fontProviders } from 'astro/config'
import node from '@astrojs/node'
import { paraglideVitePlugin } from '@inlang/paraglide-js'
import { paraglideCompilerOptions } from './project.inlang/compile-paraglide.mjs'
import { fileURLToPath, URL } from 'node:url'

import vue from '@astrojs/vue'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  devToolbar: {
    enabled: false,
  },

  adapter: node({
    mode: 'standalone',
  }),
  server: {
    port: Number(import.meta.env.PORT || 4200),
  },
  vite: {
    server: {
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
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

  integrations: [
    vue({
      template: {
        compilerOptions: {
          // treat any tag that starts with wa- as custom elements
          isCustomElement: (tag) => tag.startsWith('wa-'),
        },
      },
    }),
  ],
})
