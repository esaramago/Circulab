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
      <wa-icon name="user" label="User"></wa-icon>
      <span class="is-hidden-mobile">{{ user?.email }}</span>
    </wa-button>
    <wa-dropdown-item v-if="userHasAccess(user, 'dashboard')" @click="goto('/recursos/novo')">
      <wa-icon name="plus"></wa-icon>
      Adicionar recurso
    </wa-dropdown-item>
    <wa-dropdown-item v-if="userHasAccess(user, 'dashboard')" @click="goto('/dashboard')">
      <wa-icon name="table-list" label="Dashboard"></wa-icon>
      Dashboard
    </wa-dropdown-item>
    <wa-dropdown-item v-if="userHasAccess(user, 'backoffice')" @click="goto('/backoffice')">
      <wa-icon name="gear" label="Backoffice"></wa-icon>
      Backoffice
    </wa-dropdown-item>
    <wa-dropdown-item @click="logout">
      <wa-icon name="right-from-bracket" label="Logout"></wa-icon>
      Logout
    </wa-dropdown-item>
  </wa-dropdown>
</template>