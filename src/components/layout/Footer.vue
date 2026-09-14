<script setup lang="ts">
import { ref } from 'vue'
import Grid from '@/components/ui/Grid.vue'
import CookiePreferencesModal from '@/components/ui/CookiePreferencesModal.vue'
import { localizeHref } from '@/paraglide/runtime.js'
import { m } from '@/paraglide/messages.js'
import Container from '@/components/ui/Container.vue'

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
    <Container width="l">
      <Grid fullWidth break="mobile">
        <Grid direction="column" gap="xs">
          <a :href="localizeHref('/')" class="footer__logo">
            <img src="/img/circulab-logo.svg" :alt="m.site_title()" height="32" />
          </a>
          <p class="u-text-small">{{ m['footer.tagline']() }}</p>
        </Grid>

        <div>
          <h2 class="footer__heading">{{ m['footer.support']() }}</h2>
          <Grid align="center" gap="s">
            <a href="https://www.rizomacoop.pt/" target="_blank" rel="noopener noreferrer">
              <img src="/img/rizoma-logo.svg" alt="Rizoma Cooperativa Integral" height="50" />
            </a>
            <a href="https://www.rizomacoop.pt/" target="_blank" rel="noopener noreferrer">
              <img src="/img/lisboa-repair-map.webp" alt="Lisboa Repair Project" height="50" />
            </a>
            <a href="https://bipzip.cm-lisboa.pt/" target="_blank" rel="noopener noreferrer">
              <img src="/img/bipzip-logo.svg" alt="BIpZip" height="60" />
            </a>
          </Grid>
        </div>

        <div>
          <h2 class="footer__heading">{{ m['footer.quick_links']() }}</h2>
          <Grid class="navigation" tag="ul" direction="column" gap="xs">
            <li><a :href="localizeHref('/')">{{ m['nav.home']() }}</a></li>
            <li><a :href="localizeHref('/mapa')">{{ m['map.title']() }}</a></li>
            <li><a :href="localizeHref('/sobre')">{{ m['about.title']() }}</a></li>
            <li><a :href="localizeHref('/contactos')">{{ m['contacts.title']() }}</a></li>
          </Grid>
        </div>

        <div>
          <h2 class="footer__heading">{{ m['footer.legal']() }}</h2>
          <Grid class="navigation" tag="ul" direction="column" gap="xs">
            <li><a :href="localizeHref('/privacidade')">{{ m['footer.privacy_policy']() }}</a></li>
            <li><a :href="localizeHref('/termos')">{{ m['footer.terms_of_use']() }}</a></li>
            <li><button @click="openCookiePreferences">{{ m['footer.cookie_preferences']() }}</button></li>
            <li><a :href="localizeHref('/aviso-legal')">{{ m['footer.legal_notice']() }}</a></li>
            <li><a :href="localizeHref('/eco-design')">{{ m['footer.eco_design']() }}</a></li>
          </Grid>
        </div>
      </Grid>

      <div class="footer__bottom">
        <Grid justify="space-between" align="center" wrap gap="xs">
          <p>&copy; {{ new Date().getFullYear() }} {{ m.site_title() }}. {{ m['footer.rights_reserved']() }}</p>
          <p class="footer__credits">
            {{ m['footer.developed_by']() }} <a href="https://github.com/esaramago" target="_blank" rel="noopener noreferrer">Emanuel Saramago</a>
          </p>
        </Grid>
      </div>
    </Container>
  </footer>
  <CookiePreferencesModal ref="cookieModalRef" />
</template>

<style scoped>
.footer {
  padding: var(--wa-space-2xl) var(--wa-space-xl) var(--wa-space-l);
  background-color: var(--wa-color-neutral-10);
  color: var(--wa-color-neutral-90);
}

.footer__heading {
  font-size: var(--wa-font-size-s);
  font-weight: var(--wa-font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--wa-color-neutral-90);
  margin-block-end: var(--wa-space-s);
}

.navigation {
  list-style: none;
  padding: 0;
  margin: 0;
}

.navigation :where(a, button) {
  color: var(--wa-color-neutral-70);
  text-decoration: none;
  font-size: var(--wa-font-size-s);
  transition: color 0.2s ease;
  cursor: pointer;
}

.navigation :where(a, button):hover {
  color: var(--wa-color-brand-60);
}

.footer__bottom {
  padding-block-start: var(--wa-space-m);
  border-block-start: 1px solid var(--wa-color-neutral-100);
  font-size: var(--wa-font-size-xs);
  color: var(--wa-color-neutral-70);
}
</style>