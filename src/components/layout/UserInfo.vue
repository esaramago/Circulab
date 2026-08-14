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
  window.open(localizeHref(route), '_blank')
}

</script>

<template>
  <wa-dropdown>
    <wa-button variant="neutral" size="s" slot="trigger" with-caret>
      <wa-icon name="user" :label="m['nav.user']()"></wa-icon>
      <span class="is-hidden-mobile">{{ user?.email }}</span>
    </wa-button>
    <wa-dropdown-item v-if="userHasAccess(user, 'dashboard')" @click="goto('/recursos/novo')">
      <wa-icon name="plus"></wa-icon>
      {{ m['nav.add_resource']() }}
    </wa-dropdown-item>
    <wa-dropdown-item v-if="userHasAccess(user, 'dashboard')" @click="goto('/dashboard')">
      <wa-icon name="table-list" :label="m['nav.dashboard']()"></wa-icon>
      {{ m['nav.dashboard']() }}
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