<script setup lang="ts">
import { ref } from 'vue'
import { actions, isInputError } from 'astro:actions'
import { m } from '@/paraglide/messages.js'
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/button/button.js'
import '@webawesome/input/input.js'
import '@webawesome/textarea/textarea.js'
import '@webawesome/callout/callout.js'
import '@webawesome/icon/icon.js'

const formRef = ref<HTMLFormElement | null>(null)
const nameRef = ref<any>(null)
const subjectRef = ref<any>(null)
const messageRef = ref<any>(null)

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const validateFields = () => {
  if (nameRef.value) {
    const val = nameRef.value.value?.trim() || ''
    if (val.length > 0 && val.length < 2) {
      nameRef.value.setCustomValidity('O nome deve ter pelo menos 2 caracteres')
    } else {
      nameRef.value.setCustomValidity('')
    }
  }

  if (subjectRef.value) {
    const val = subjectRef.value.value?.trim() || ''
    if (val.length > 0 && val.length < 3) {
      subjectRef.value.setCustomValidity('O assunto deve ter pelo menos 3 caracteres')
    } else {
      subjectRef.value.setCustomValidity('')
    }
  }

  if (messageRef.value) {
    const val = messageRef.value.value?.trim() || ''
    if (val.length > 0 && val.length < 10) {
      messageRef.value.setCustomValidity('A mensagem deve ter pelo menos 10 caracteres')
    } else {
      messageRef.value.setCustomValidity('')
    }
  }
}

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  validateFields()

  const form = formRef.value
  if (!form) return

  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const formData = new FormData(form)
    const { data, error } = await actions.submitContact(formData)

    if (error) {
      if (isInputError(error)) {
        const firstIssue = error.issues?.[0]?.message
        const firstField = Object.values(error.fields)[0]?.[0]
        errorMessage.value = firstIssue || firstField || m['contacts.error']()
      } else {
        errorMessage.value = error.message || m['contacts.error']()
      }
    } else if (data?.success) {
      successMessage.value = data.message || m['contacts.success']()
      form.reset()
      validateFields()
    }
  } catch (err: any) {
    errorMessage.value = err.message || m['contacts.error']()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="contact-form-wrapper">
    <wa-callout v-if="successMessage" variant="success" class="status-message">
      <wa-icon slot="icon" name="circle-check"></wa-icon>
      {{ successMessage }}
    </wa-callout>

    <wa-callout v-if="errorMessage" variant="danger" class="status-message">
      <wa-icon slot="icon" name="triangle-exclamation"></wa-icon>
      {{ errorMessage }}
    </wa-callout>

    <form ref="formRef" method="post" @submit="handleSubmit">
      <Grid gap="m" direction="column">
        <wa-input
          id="name"
          ref="nameRef"
          name="name"
          type="text"
          :label="m['contacts.name']()"
          :placeholder="m['contacts.name_placeholder']()"
          minlength="2"
          required
          :disabled="loading"
          @input="validateFields"
        ></wa-input>

        <wa-input
          id="email"
          name="email"
          type="email"
          :label="m['contacts.email']()"
          :placeholder="m['contacts.email_placeholder']()"
          required
          :disabled="loading"
        ></wa-input>

        <wa-input
          id="subject"
          ref="subjectRef"
          name="subject"
          type="text"
          :label="m['contacts.subject']()"
          :placeholder="m['contacts.subject_placeholder']()"
          minlength="3"
          required
          :disabled="loading"
          @input="validateFields"
        ></wa-input>

        <wa-textarea
          id="message"
          ref="messageRef"
          name="message"
          :label="m['contacts.message']()"
          :placeholder="m['contacts.message_placeholder']()"
          :rows="5"
          minlength="10"
          with-count
          required
          :disabled="loading"
          @input="validateFields"
        ></wa-textarea>

        <wa-button
          variant="brand"
          type="submit"
          size="l"
          :loading="loading"
          :disabled="loading"
        >
          <wa-icon slot="start" name="paper-plane"></wa-icon>
          {{ m['contacts.send']() }}
        </wa-button>
      </Grid>
    </form>
  </div>
</template>

<style scoped>
.status-message {
  margin-block-end: var(--wa-space-m);
}
</style>

