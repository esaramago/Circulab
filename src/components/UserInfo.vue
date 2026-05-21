<script setup lang="ts">
import type { AppUser } from '@/types/env'
import { localizeHref } from '@/paraglide/runtime.js'
import '@webawesome/button/button.js'
import '@webawesome/dropdown/dropdown.js'
import '@webawesome/dropdown-item/dropdown-item.js'
import { actions } from 'astro:actions'

const props = defineProps<{
  user: AppUser
  locale: 'en' | 'pt'
}>()

async function logout() {
  const { data } = await actions.logout()
  if (data?.success) {
    window.location.href = localizeHref('/', { locale: props.locale })
  }
}
</script>

<template>
  <wa-dropdown>
    <wa-button variant="neutral" size="s" appearance="plain" slot="trigger" with-caret>
      <wa-icon name="user" label="User"></wa-icon>
      {{ user?.email }}
    </wa-button>
    <wa-dropdown-item @click="logout">Logout</wa-dropdown-item>
  </wa-dropdown>
</template>

<style scoped>

</style>
