<script setup lang="ts">
import { ref } from 'vue'
import Grid from '@/components/ui/Grid.vue'
import CookiePreferencesModal from '@/components/ui/CookiePreferencesModal.vue'
import { localizeHref } from '@/paraglide/runtime.js'
import { m } from '@/paraglide/messages.js'

const cookieModalRef = ref<InstanceType<typeof CookiePreferencesModal> | null>(null)

function openCookiePreferences(event: Event) {
  event.preventDefault()
  if (cookieModalRef.value) {
    cookieModalRef.value.open()
  }
}
</script>

<template>
  <footer class="footer">
    <div class="footer__content">
      <div class="footer__grid">
        <div class="footer__brand">
          <a :href="localizeHref('/')" class="footer__logo">
            <span>{{ m.site_title() }}</span>
          </a>
          <p class="footer__tagline">{{ m['footer.tagline']() }}</p>
        </div>

        <div class="footer__column">
          <h2 class="footer__heading">{{ m['footer.quick_links']() }}</h2>
          <ul class="footer__links">
            <li><a :href="localizeHref('/')">{{ m['nav.home']() }}</a></li>
            <li><a :href="localizeHref('/mapa')">{{ m['map.title']() }}</a></li>
            <li><a :href="localizeHref('/sobre')">{{ m['about.title']() }}</a></li>
            <li><a :href="localizeHref('/contactos')">{{ m['contacts.title']() }}</a></li>
          </ul>
        </div>

        <div class="footer__column">
          <h2 class="footer__heading">{{ m['footer.legal']() }}</h2>
          <ul class="footer__links">
            <li><a :href="localizeHref('/privacidade')">{{ m['footer.privacy_policy']() }}</a></li>
            <li><a :href="localizeHref('/termos')">{{ m['footer.terms_of_use']() }}</a></li>
            <li><a href="#" @click="openCookiePreferences">{{ m['footer.cookie_preferences']() }}</a></li>
            <li><a :href="localizeHref('/aviso-legal')">{{ m['footer.legal_notice']() }}</a></li>
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <Grid justify="space-between" align="center" wrap>
          <p>&copy; {{ new Date().getFullYear() }} {{ m.site_title() }}. {{ m['footer.rights_reserved']() }}</p>
        </Grid>
      </div>
    </div>

    <CookiePreferencesModal ref="cookieModalRef" />
  </footer>
</template>

<style scoped>
.footer {
  padding-block-start: var(--wa-space-2xl);
  padding-block-end: var(--wa-space-l);
  padding-inline: var(--wa-space-l);
  border-block-start: 1px solid var(--wa-color-neutral-100);
  background-color: var(--wa-color-neutral-10);
  color: var(--wa-color-neutral-90);
}

.footer__content {
  max-width: 120rem;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-xl);
}

.footer__grid {
  display: grid;
  grid-template-columns: 2fr repeat(2, 1fr);
  gap: var(--wa-space-xl);
}

@media (max-width: 767px) {
  .footer__grid {
    grid-template-columns: 1fr;
    gap: var(--wa-space-l);
  }
}

.footer__brand {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-s);
}

.footer__logo {
  display: inline-flex;
  align-items: flex-end;
  gap: var(--wa-space-xs);
  font-size: var(--wa-font-size-l);
  font-weight: var(--wa-font-weight-bold);
  color: var(--wa-color-brand-60);
  text-decoration: none;
  line-height: 1;

  &::before {
    content: '';
    display: block;
    width: 2rem;
    height: 2rem;
    border-radius: var(--wa-border-radius-circle);
    background-color: currentColor;
  }
}

.footer__tagline {
  font-size: var(--wa-font-size-s);
  color: var(--wa-color-neutral-70);
  max-width: 32ch;
}

.footer__heading {
  font-size: var(--wa-font-size-s);
  font-weight: var(--wa-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--wa-color-neutral-90);
  margin-block-end: var(--wa-space-s);
}

.footer__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-xs);
}

.footer__links a {
  color: var(--wa-color-neutral-70);
  text-decoration: none;
  font-size: var(--wa-font-size-s);
  transition: color 0.2s ease;
}

.footer__links a:hover {
  color: var(--wa-color-brand-60);
}

.footer__bottom {
  padding-block-start: var(--wa-space-m);
  border-block-start: 1px solid var(--wa-color-neutral-100);
  font-size: var(--wa-font-size-xs);
  color: var(--wa-color-neutral-70);
}
</style>