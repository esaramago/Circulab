// @ts-check
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  site: import.meta.env.SITE,
  security: {
    allowedDomains: [
      {hostname: import.meta.env.SITE}
    ]
  },
})
