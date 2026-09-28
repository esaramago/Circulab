<script setup lang="ts">
import type { AppUser } from '@/types/domain/user'
import { localizeHref } from '@/paraglide/runtime.js'
import { m } from '@/paraglide/messages.js'
import '@webawesome/button/button.js'
import '@webawesome/dropdown/dropdown.js'
import '@webawesome/dropdown-item/dropdown-item.js'
import { actions } from 'astro:actions'
import { userHasAccess } from '@/utils/userHasAccess'

const props = defineProps<{
  user: AppUser
}>()

async function logout() {
  const { data } = await actions.logout()
  if (data?.success) {
    window.location.href = localizeHref('/')
  }
}

function goto(route: string) {
  window.location.href = localizeHref(route)
}

</script>

<template>
  <wa-dropdown>
    <wa-button variant="neutral" size="s" slot="trigger">
      <wa-icon name="user" :label="m['nav.user']()"></wa-icon>
    </wa-button>
    <wa-dropdown-item @click="goto('/recursos/novo')">
      <wa-icon name="plus"></wa-icon>
      {{ user?.role?.code === 'contributor' ? m['nav.suggest_resource']() : m['nav.add_resource']() }}
    </wa-dropdown-item>
    <wa-dropdown-item @click="goto('/dashboard')">
      <wa-icon name="table-list" :label="m['nav.dashboard']()"></wa-icon>
      {{ m['nav.dashboard']() }}
    </wa-dropdown-item>
    <wa-dropdown-item v-if="userHasAccess(user, 'moderation')" @click="goto('/dashboard/moderacao')">
      <wa-icon name="clipboard-check" :label="m['nav.moderation']()"></wa-icon>
      {{ m['nav.moderation']() }}
    </wa-dropdown-item>
    <wa-dropdown-item v-if="userHasAccess(user, 'backoffice')" @click="goto('/backoffice')">
      <wa-icon name="gear" :label="m['nav.backoffice']()"></wa-icon>
      {{ m['nav.backoffice']() }}
    </wa-dropdown-item>
    <wa-dropdown-item @click="logout">
      <wa-icon name="right-from-bracket" :label="m['nav.logout']()"></wa-icon>
      {{ m['nav.logout']() }}
    </wa-dropdown-item>
  </wa-dropdown>
</template>