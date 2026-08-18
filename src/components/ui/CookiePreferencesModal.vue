<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { m } from '@/paraglide/messages.js'
import '@webawesome/dialog/dialog.js'
import '@webawesome/switch/switch.js'
import '@webawesome/button/button.js'

const dialogRef = ref<HTMLElement | null>(null)
const analyticsConsent = ref(false)
const showBanner = ref(false)

const COOKIE_PREF_KEY = 'circulab_cookie_preferences'

onMounted(() => {
  const saved = localStorage.getItem(COOKIE_PREF_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      analyticsConsent.value = !!parsed.analytics
      showBanner.value = false
    } catch {
      showBanner.value = true
    }
  } else {
    showBanner.value = true
  }
})

function open() {
  if (dialogRef.value) {
    // @ts-expect-error wa-dialog custom element property
    dialogRef.value.open = true
  }
}

function close() {
  if (dialogRef.value) {
    // @ts-expect-error wa-dialog custom element property
    dialogRef.value.open = false
  }
}

function handleSave() {
  localStorage.setItem(COOKIE_PREF_KEY, JSON.stringify({
    essential: true,
    analytics: analyticsConsent.value,
    timestamp: new Date().toISOString()
  }))
  showBanner.value = false
  close()
}

function handleAcceptAll() {
  analyticsConsent.value = true
  localStorage.setItem(COOKIE_PREF_KEY, JSON.stringify({
    essential: true,
    analytics: true,
    timestamp: new Date().toISOString()
  }))
  showBanner.value = false
  close()
}

function toggleAnalytics(event: Event) {
  const target = event.target as HTMLInputElement
  analyticsConsent.value = target.checked
}

defineExpose({
  open
})
</script>

<template>
  <div>
    <!-- Bottom Cookie Banner (when user hasn't set preferences yet) -->
    <div v-if="showBanner" class="cookie-banner" role="region" aria-label="Cookie consent">
      <div class="cookie-banner__content">
        <p class="cookie-banner__text">{{ m['cookies.description']() }}</p>
        <div class="cookie-banner__actions">
          <wa-button size="s" variant="neutral" @click="open">
            {{ m['footer.cookie_preferences']() }}
          </wa-button>
          <wa-button size="s" variant="brand" @click="handleAcceptAll">
            {{ m['cookies.accept_all']() }}
          </wa-button>
        </div>
      </div>
    </div>

    <!-- Cookie Preferences Modal -->
    <wa-dialog ref="dialogRef" :label="m['cookies.title']()" class="cookie-dialog">
      <p class="cookie-dialog__desc">{{ m['cookies.description']() }}</p>

      <div class="cookie-dialog__section">
        <div class="cookie-dialog__row">
          <div>
            <h3>{{ m['cookies.essential_title']() }}</h3>
            <p>{{ m['cookies.essential_desc']() }}</p>
          </div>
          <wa-switch checked disabled></wa-switch>
        </div>

        <div class="cookie-dialog__row">
          <div>
            <h3>{{ m['cookies.analytics_title']() }}</h3>
            <p>{{ m['cookies.analytics_desc']() }}</p>
          </div>
          <wa-switch :checked="analyticsConsent" @wa-change="toggleAnalytics"></wa-switch>
        </div>
      </div>

      <div slot="footer" class="cookie-dialog__footer">
        <wa-button variant="neutral" @click="close">
          {{ m['cookies.close']() }}
        </wa-button>
        <wa-button variant="primary" @click="handleSave">
          {{ m['cookies.save']() }}
        </wa-button>
        <wa-button variant="brand" @click="handleAcceptAll">
          {{ m['cookies.accept_all']() }}
        </wa-button>
      </div>
    </wa-dialog>
  </div>
</template>

<style scoped>
/* Cookie Banner */
.cookie-banner {
  position: fixed;
  inset-block-end: var(--wa-space-m);
  inset-inline-start: var(--wa-space-m);
  inset-inline-end: var(--wa-space-m);
  max-width: 70rem;
  margin-inline: auto;
  z-index: 1000;
  padding: var(--wa-space-m);
  background-color: var(--wa-color-brand-20);
  border: 1px solid var(--wa-color-brand-40);
  border-radius: var(--wa-border-radius-m);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
}

.cookie-banner__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wa-space-m);

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.cookie-banner__text {
  font-size: var(--wa-font-size-s);
  color: var(--wa-color-neutral-90);
  margin: 0;
}

.cookie-banner__actions {
  display: flex;
  gap: var(--wa-space-xs);
  flex-shrink: 0;

  @media (max-width: 767px) {
    justify-content: flex-end;
  }
}

/* Cookie Dialog */
wa-dialog:not(:defined) {
  display: none !important;
}
.cookie-dialog::part(dialog) {
  --width: 80rem;
}
.cookie-dialog__desc {
  margin-block-end: var(--wa-space-m);
  color: var(--wa-color-neutral-80);
}

.cookie-dialog__section {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-l);
  padding-block: var(--wa-space-m);
  border-block-start: 1px solid var(--wa-color-neutral-100);
}

.cookie-dialog__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--wa-space-m);
}

.cookie-dialog__row h3 {
  font-size: var(--wa-font-size-m);
  font-weight: var(--wa-font-weight-semibold);
  margin-block-end: var(--wa-space-2xs);
}

.cookie-dialog__row p {
  font-size: var(--wa-font-size-s);
  color: var(--wa-color-neutral-80);
}

.cookie-dialog__footer {
  display: flex;
  gap: var(--wa-space-s);
  justify-content: flex-end;
  flex-wrap: wrap;
}
</style>
