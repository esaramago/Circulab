<script setup lang="ts">
import { ref } from 'vue'
import { actions } from 'astro:actions'
import { supabase } from '@/utils/supabase'
import Grid from '@/components/ui/Grid.vue'
import { localizeHref } from '@/paraglide/runtime.js'
import { m } from '@/paraglide/messages.js'
import '@webawesome/card/card.js'
import '@webawesome/callout/callout.js'
import '@webawesome/button/button.js'
import '@webawesome/input/input.js'

const props = defineProps<{
  redirectUrl?: string
}>()

const email = ref('')
const code = ref('')
const isSending = ref(false)
const isVerifying = ref(false)
const codeSent = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loginHref = props.redirectUrl
  ? `${localizeHref('/login')}?redirect=${encodeURIComponent(props.redirectUrl)}`
  : localizeHref('/login')

async function handleSendOtp() {
  if (isSending.value) return
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !email.value.includes('@')) {
    errorMessage.value = m['auth.otp_email_required']()
    return
  }

  isSending.value = true
  try {
    const { data, error } = await actions.sendOtp({ email: email.value.trim() })
    if (error) {
      throw new Error(error.message)
    }
    codeSent.value = true
    successMessage.value = data?.message || m['auth.otp_code_sent']({ email: email.value })
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : m['auth.failed_send_reset']()
  } finally {
    isSending.value = false
  }
}

async function handleVerifyOtp() {
  if (isVerifying.value) return
  errorMessage.value = ''

  if (!code.value || code.value.trim().length < 6) {
    errorMessage.value = m['auth.otp_code_required']()
    return
  }

  isVerifying.value = true
  try {
    const { data, error } = await actions.verifyOtp({
      email: email.value.trim(),
      token: code.value.trim(),
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data?.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      })
    }

    const targetUrl = props.redirectUrl || '/mapa'
    window.location.href = localizeHref(targetUrl)
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : m['auth.otp_invalid_code']()
  } finally {
    isVerifying.value = false
  }
}
</script>

<template>
  <wa-card>
    <Grid gap="m" direction="column">
      <wa-callout v-if="errorMessage" variant="danger">
        {{ errorMessage }}
      </wa-callout>

      <wa-callout v-if="successMessage" variant="success">
        {{ successMessage }}
      </wa-callout>

      <form v-if="!codeSent" @submit.prevent="handleSendOtp">
        <Grid gap="s" direction="column">
          <wa-input
            id="register-email"
            type="email"
            name="email"
            required
            :label="m['auth.email_label']()"
            :placeholder="m['auth.email_label']()"
            :value="email"
            @input="email = ($event.target as HTMLInputElement).value"
            autofocus
          ></wa-input>

          <wa-button
            variant="primary"
            type="submit"
            :loading="isSending || null"
            :disabled="isSending || null"
          >
            {{ m['auth.otp_send_code']() }}
          </wa-button>
        </Grid>
      </form>

      <form v-else @submit.prevent="handleVerifyOtp">
        <Grid gap="s" direction="column">
          <wa-input
            id="register-email-display"
            type="email"
            name="email"
            :label="m['auth.email_label']()"
            :value="email"
            disabled
          ></wa-input>

          <wa-input
            id="register-code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            required
            :label="m['auth.otp_code_label']()"
            :placeholder="m['auth.otp_code_placeholder']()"
            :value="code"
            @input="code = ($event.target as HTMLInputElement).value"
            autofocus
          ></wa-input>

          <wa-button
            variant="primary"
            type="submit"
            :loading="isVerifying || null"
            :disabled="isVerifying || null"
          >
            {{ m['auth.verify_and_register']() }}
          </wa-button>

          <p>
            <wa-button
              variant="neutral"
              appearance="plain"
              :disabled="isSending || isVerifying || null"
              @click="handleSendOtp"
            >
              {{ m['auth.otp_resend_code']() }}
            </wa-button>
          </p>
        </Grid>
      </form>

      <p class="auth-switch">
        {{ m['auth.already_have_account']() }}
        <a :href="loginHref">{{ m['auth.login_title']() }}</a>
      </p>
    </Grid>
  </wa-card>
</template>

<style scoped>
.auth-switch {
  margin-block-start: var(--wa-space-s);
}
</style>
