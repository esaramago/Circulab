<script setup lang="ts">
import type { AppUser } from '@/types/domain/user'
import { localizeHref } from '@/paraglide/runtime.js'
import '@webawesome/button/button.js'
import '@webawesome/dropdown/dropdown.js'
import '@webawesome/dropdown-item/dropdown-item.js'
import { actions } from 'astro:actions'
import { userHasAccess } from '@/utils/userHasAccess'

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

function goto(route: string) {
  window.location.href = localizeHref(route, props.locale ? { locale: props.locale } : undefined)
}
</script>

<template>
  <wa-dropdown>
    <wa-button variant="neutral" size="s" appearance="plain" slot="trigger" with-caret>
      <wa-icon name="user" label="User"></wa-icon>
      {{ user?.email }}
    </wa-button>
    <wa-dropdown-item v-if="userHasAccess(user, 'dashboard')" @click="goto('/dashboard')">Dashboard</wa-dropdown-item>
    <wa-dropdown-item v-if="userHasAccess(user, 'backoffice')" @click="goto('/backoffice')">Backoffice</wa-dropdown-item>
    <wa-dropdown-item @click="logout">Logout</wa-dropdown-item>
  </wa-dropdown>
</template>

<style scoped>

</style>
