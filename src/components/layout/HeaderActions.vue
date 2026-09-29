<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { AppUser } from '@/types/domain/user'
import { userHasAccess } from '@/utils/userHasAccess'
import { localizeHref } from '@/paraglide/runtime.js'
import { m } from '@/paraglide/messages.js'
import Grid from '@/components/ui/Grid.vue'
import UserInfo from '@/components/layout/UserInfo.vue'
import '@webawesome/button/button.js'
import '@webawesome/icon/icon.js'
import '@webawesome/badge/badge.js'
import '@webawesome/drawer/drawer.js'

const props = defineProps<{
  user?: AppUser | null
  pendingSuggestionsCount?: number
  langLink?: {
    href: string
    label: string
  }
}>()

const pendingSuggestionsCount = ref(props.pendingSuggestionsCount ?? 0)
const isDrawerOpen = ref(false)

function toggleDrawer() {
  const drawer = document.getElementById('header-drawer') as (HTMLElement & { open: boolean }) | null
  if (!drawer) return
  drawer.open = !drawer.open
  isDrawerOpen.value = drawer.open
}

function handleDrawerHide() {
  isDrawerOpen.value = false
}

function handleDrawerShow() {
  isDrawerOpen.value = true
}

function handleModerationCountUpdated(event: Event) {
  const customEvent = event as CustomEvent<{ count: number }>
  pendingSuggestionsCount.value = customEvent.detail?.count ?? 0
}

function handlePageLoad() {
  const drawer = document.getElementById('header-drawer') as (HTMLElement & { open: boolean }) | null
  if (drawer && drawer.open) {
    drawer.open = false
    isDrawerOpen.value = false
  }
}

onMounted(() => {
  const drawer = document.getElementById('header-drawer')
  if (drawer) {
    drawer.addEventListener('wa-after-hide', handleDrawerHide)
    drawer.addEventListener('wa-after-show', handleDrawerShow)
  }
  window.addEventListener('moderation-count-updated', handleModerationCountUpdated)
  document.addEventListener('astro:page-load', handlePageLoad)
})

onUnmounted(() => {
  const drawer = document.getElementById('header-drawer')
  if (drawer) {
    drawer.removeEventListener('wa-after-hide', handleDrawerHide)
    drawer.removeEventListener('wa-after-show', handleDrawerShow)
  }
  window.removeEventListener('moderation-count-updated', handleModerationCountUpdated)
  document.removeEventListener('astro:page-load', handlePageLoad)
})
</script>

<template>
  <Grid align="center">
    <a v-if="langLink" :href="langLink.href" class="nav-lang">
      {{ langLink.label }}
    </a>

    <wa-button
      v-if="user && userHasAccess(user, 'moderation')"
      id="moderation-nav-button"
      class="moderation-nav-button"
      pill
      :href="localizeHref('/dashboard/moderacao')"
      size="s"
      :title="m['nav.moderation']()"
    >
      <wa-icon name="clipboard-check" :label="m['nav.moderation']()"></wa-icon>
      <wa-badge
        v-if="pendingSuggestionsCount > 0"
        id="moderation-count-badge"
        slot="end"
        variant="danger"
        pill
      >
        {{ pendingSuggestionsCount }}
      </wa-badge>
    </wa-button>

    <UserInfo v-if="user" :user="user" />
    <wa-button
      v-else
      pill
      :href="localizeHref('/login')"
      variant="primary"
      size="s"
    >
      <wa-icon name="arrow-right-to-bracket"></wa-icon>
    </wa-button>

    <wa-button
      variant="neutral"
      class="nav-toggle"
      id="nav-toggle"
      aria-controls="header-drawer"
      :aria-expanded="isDrawerOpen ? 'true' : 'false'"
      size="s"
      @click="toggleDrawer"
    >
      <wa-icon
        class="nav-toggle__icon"
        :name="isDrawerOpen ? 'xmark' : 'bars'"
        :label="isDrawerOpen ? m['nav.close_menu']() : m['nav.open_menu']()"
      ></wa-icon>
    </wa-button>
  </Grid>
</template>

<style scoped>
.moderation-nav-button::part(base),
#moderation-nav-button::part(base) {
  width: var(--wa-form-control-height);
  aspect-ratio: 1;
}

.nav-toggle {
  @media (min-width: 768px) {
    display: none;
  }
}

.nav-lang {
  position: relative;
  display: block;
  padding: var(--wa-space-xs) var(--wa-space-xs) var(--wa-space-3xs);
  border-block-end: 3px solid transparent;
  text-decoration: none;
  font-weight: var(--wa-font-weight-semibold);
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover,
  &.is-active {
    color: var(--wa-color-brand-60);
    font-weight: var(--wa-font-weight-bold);
    border-block-end-color: var(--wa-color-brand-60);
  }

  @media (max-width: 767px) {
    display: none;
  }
}
</style>
