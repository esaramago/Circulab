<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import { ref, onMounted, computed } from 'vue'
import { useStore } from '@nanostores/vue'
import { actions } from 'astro:actions'
import {
  clearAddResourceDraft,
  getAddResourcePayload,
  ensureDraftLoaded,
  $editingResourceId,
  $editingSuggestionId,
} from '@/stores/addResource'
import { supabase } from '@/utils/supabase'
import { getImage, clearImages } from '@/utils/imageStore'
import type { DescriptionDraft, LocationDraft } from '@/types/add-resource-draft'
import '@webawesome/callout/callout.js'
import '@webawesome/card/card.js'
import '@webawesome/dialog/dialog.js'
import '@webawesome/button/button.js'
import '@webawesome/input/input.js'
import { localizeHref } from '@/paraglide/runtime.js'
import { m } from '@/paraglide/messages.js'
import { i18nDb } from '@/utils/i18nDb'
import Gallery from '@/components/ui/Gallery.vue'
import GalleryItem from '@/components/ui/GalleryItem.vue'
import ResourceSummary from '@/components/pages/resources/ResourceSummary.vue'


type AddResourcePayload = DescriptionDraft & LocationDraft

const resumeData = ref<AddResourcePayload | null>(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const suggestionDialogOpen = ref(false)
const otpDialogOpen = ref(false)
const otpEmail = ref('')
const otpCode = ref('')
const isOtpSending = ref(false)
const isOtpVerifying = ref(false)
const otpCodeSent = ref(false)
const otpErrorMessage = ref('')
const otpSuccessMessage = ref('')
const editingResourceId = useStore($editingResourceId)
const editingSuggestionId = useStore($editingSuggestionId)
const isEdit = computed(() => !!(editingResourceId.value || editingSuggestionId.value))

const backUrl = computed(() => {
  if (editingSuggestionId.value) {
    return `/recursos/editar?suggestion_id=${editingSuggestionId.value}`
  }
  return isEdit.value ? `/recursos/editar?id=${editingResourceId.value}` : '/recursos/novo/contactos'
})

function goToMap() {
  window.location.href = localizeHref('/mapa')
}

const category = ref<string | null>(null)
const typology = ref<string | null>(null)
const characteristics = ref<string | null>(null)

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const suggestionId = urlParams.get('suggestion_id')
  const id = urlParams.get('id')
  if (suggestionId) {
    await ensureDraftLoaded(suggestionId, { isSuggestion: true })
  } else if (id) {
    await ensureDraftLoaded(id)
  }

  const payload = getAddResourcePayload() as AddResourcePayload
  if (payload.images && payload.images.length > 0) {
    const updatedImages = []
    for (const img of payload.images) {
      const blob = await getImage(img.id)
      if (blob) {
        updatedImages.push({
          ...img,
          url: URL.createObjectURL(blob),
        })
      } else {
        updatedImages.push(img)
      }
    }
    resumeData.value = {
      ...payload,
      images: updatedImages,
    }
  } else {
    resumeData.value = payload
  }
  if (payload.typology_id) {
    const { data: typologyData } = await actions.getTypologyById({ id: payload.typology_id })
    typology.value = typologyData?.typology ? i18nDb(typologyData.typology.name as any) : null
  }

  if (payload.category_id) {
    const { data: categoryData } = await actions.getCategoryById({ id: payload.category_id })
    category.value = categoryData?.category ? i18nDb(categoryData.category.name as any) : null
  }

  console.log(category.value)
  console.log(typology.value)
})

async function handleSendOtp() {
  if (isOtpSending.value) return
  otpErrorMessage.value = ''
  otpSuccessMessage.value = ''

  if (!otpEmail.value || !otpEmail.value.includes('@')) {
    otpErrorMessage.value = m['auth.otp_email_required']()
    return
  }

  isOtpSending.value = true
  try {
    const { data, error } = await actions.sendOtp({ email: otpEmail.value.trim() })
    if (error) {
      throw new Error(error.message)
    }
    otpCodeSent.value = true
    otpSuccessMessage.value = data?.message || m['auth.otp_code_sent']({ email: otpEmail.value })
  } catch (err: any) {
    otpErrorMessage.value = err.message || m['auth.failed_send_reset']()
  } finally {
    isOtpSending.value = false
  }
}

async function handleVerifyOtpAndSubmit() {
  if (isOtpVerifying.value) return
  otpErrorMessage.value = ''

  if (!otpCode.value || otpCode.value.trim().length < 6) {
    otpErrorMessage.value = m['auth.otp_code_required']()
    return
  }

  isOtpVerifying.value = true
  try {
    const { data, error } = await actions.verifyOtp({
      email: otpEmail.value.trim(),
      token: otpCode.value.trim(),
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

    otpDialogOpen.value = false
    await executeSubmit()
  } catch (err: any) {
    otpErrorMessage.value = err.message || m['auth.otp_invalid_code']()
  } finally {
    isOtpVerifying.value = false
  }
}

async function handleSubmit() {
  if (isSubmitting.value) return
  errorMessage.value = ''

  if (isEdit.value) {
    await executeSubmit()
    return
  }

  const { data: sessionData } = await actions.getSession()
  if (!sessionData) {
    if (!otpEmail.value && resumeData.value?.email) {
      otpEmail.value = resumeData.value.email
    }
    otpErrorMessage.value = ''
    otpSuccessMessage.value = ''
    otpDialogOpen.value = true
    return
  }

  await executeSubmit()
}

async function executeSubmit() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // 0. Sync client-side supabase session with cookie session
    const { data: sessionData, error: sessionError } = await actions.getSession()
    if (sessionError) {
      throw new Error(m['resources.error_get_session']({ error: sessionError.message }))
    }
    
    let userId = ''
    if (sessionData) {
      const { data: authData, error: setSessionError } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      })
      if (setSessionError) {
        throw new Error(m['resources.error_auth_client']({ error: setSessionError.message }))
      }
      userId = authData.user?.id || ''
    } else {
      throw new Error(m['resources.user_not_authenticated']())
    }

    const isSuggestionEdit = !!editingSuggestionId.value
    const storageId = editingResourceId.value || editingSuggestionId.value || crypto.randomUUID()
    const pinId = editingResourceId.value || (isSuggestionEdit ? undefined : storageId)
    const uploadedImages: { url: string; alt: string }[] = []

    // 1. Upload files from IndexedDB to Supabase Storage
    const draftImages = resumeData.value?.images || []
    for (const img of draftImages) {
      const blob = await getImage(img.id)
      if (blob) {
        const extension = blob.type === 'image/webp' ? 'webp' : (img.alt.split('.').pop() || 'jpg')
        const path = userId ? `${userId}/${storageId}/${img.id}.${extension}` : `${storageId}/${img.id}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from('pin-images')
          .upload(path, blob, {
            cacheControl: '31536000, immutable',
            upsert: false,
          })

        if (uploadError) {
          throw new Error(m['resources.error_upload_image']({ error: uploadError.message }))
        }

        uploadedImages.push({
          url: path,
          alt: img.alt,
        })
      } else {
        // It's an existing image - keep its path!
        uploadedImages.push({
          url: img.id,
          alt: img.alt,
        })
      }
    }

    // 2. Call actions.addResource or actions.editResource
    const payload = {
      ...(pinId ? { id: pinId } : {}),
      title: resumeData.value?.title || '',
      description: resumeData.value?.description || '',
      coordinates: {
        latitude: Number(resumeData.value?.coordinates?.latitude),
        longitude: Number(resumeData.value?.coordinates?.longitude),
      },
      typology_id: resumeData.value?.typology_id || '',
      category_id: resumeData.value?.category_id || '',
      characteristics_ids: resumeData.value?.characteristics_ids || [],
      location_name: resumeData.value?.location_name,
      address: resumeData.value?.address,
      postal_code: resumeData.value?.postal_code,
      email: resumeData.value?.email || undefined,
      phone: resumeData.value?.phone != null ? resumeData.value.phone : undefined,
      phone_area_code: resumeData.value?.phone_area_code != null ? resumeData.value.phone_area_code : undefined,
      access: resumeData.value?.access || undefined,
      accessibility: resumeData.value?.accessibility ?? null,
      has_opening_hours: resumeData.value?.has_opening_hours ?? false,
      opening_hours: resumeData.value?.has_opening_hours ? (resumeData.value?.opening_hours || undefined) : undefined,
      networks: resumeData.value?.networks ? resumeData.value.networks.map(n => ({ slug: n.slug, value: n.value })) : undefined,
      images: uploadedImages,
    }

    let result
    if (isSuggestionEdit) {
      result = await actions.updateSuggestedResource({
        ...payload,
        suggestion_id: editingSuggestionId.value!,
      })
    } else if (isEdit.value) {
      result = await actions.editResource({
        ...payload,
        id: editingResourceId.value!,
      })
    } else {
      result = await actions.addResource(payload)
    }

    if (result.error) {
      throw new Error(result.error.message || m['resources.error_save']())
    }

    // 3. Clear local storage/IndexedDB on success
    clearAddResourceDraft()
    await clearImages()

    if (isSuggestionEdit) {
      window.location.href = localizeHref('/dashboard/moderacao')
      return
    }

    if (result.data?.isSuggestion) {
      suggestionDialogOpen.value = true
      return
    }

    goToMap()
  } catch (err: any) {
    console.error(err)
    errorMessage.value = err.message || m['resources.error_submit']()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <wa-callout v-if="errorMessage" variant="danger" style="margin-block-end: var(--wa-space-m);">
    {{ errorMessage }}
  </wa-callout>

  <wa-card>
    <Grid gap="l" direction="column" v-if="resumeData">

      <Gallery>
        <template v-if="resumeData.images?.length > 0">
          <GalleryItem v-for="image in resumeData.images" :key="image.id" :src="image.url" :alt="image.alt" />
        </template>
      </Gallery>

      <ResourceSummary
        :resource="{
          ...resumeData,
          category,
          typology,
          characteristics,
        }"
      />

    </Grid>
  </wa-card>

  <Grid justify="end">
    <wa-button
      variant="outlined"
      appearance="outlined"
      :disabled="isSubmitting || null"
      :href="localizeHref(backUrl)">{{ m['resources.back']() }}</wa-button
    >
    <wa-button variant="brand" :loading="isSubmitting || null" :disabled="isSubmitting || null" @click="handleSubmit">
      {{ isEdit ? m['resources.save']() : m['resources.add']() }}
    </wa-button>
  </Grid>

  <wa-dialog
    id="otp-confirm-dialog"
    :label="m['auth.otp_dialog_title']()"
    :open="otpDialogOpen ? '' : null"
    @wa-after-hide="otpDialogOpen = false"
  >
    <Grid gap="m" direction="column">
      <p>{{ m['auth.otp_dialog_desc']() }}</p>

      <wa-callout v-if="otpErrorMessage" variant="danger">
        {{ otpErrorMessage }}
      </wa-callout>

      <wa-callout v-if="otpSuccessMessage" variant="success">
        {{ otpSuccessMessage }}
      </wa-callout>

      <wa-input
        type="email"
        :label="m['auth.email_label']()"
        :value="otpEmail"
        @input="otpEmail = ($event.target as HTMLInputElement).value"
        required
        :disabled="otpCodeSent || isOtpSending || isOtpVerifying || null"
      ></wa-input>

      <wa-input
        v-if="otpCodeSent"
        type="text"
        inputmode="numeric"
        maxlength="6"
        :label="m['auth.otp_code_label']()"
        :placeholder="m['auth.otp_code_placeholder']()"
        :value="otpCode"
        @input="otpCode = ($event.target as HTMLInputElement).value"
        required
        :disabled="isOtpVerifying || null"
      ></wa-input>
    </Grid>

    <div slot="footer" class="dialog-footer">
      <wa-button
        v-if="!otpCodeSent"
        variant="brand"
        :loading="isOtpSending || null"
        :disabled="isOtpSending || null"
        @click="handleSendOtp"
      >
        {{ m['auth.otp_send_code']() }}
      </wa-button>

      <Grid gap="s" justify="end" v-else>
        <wa-button
          variant="neutral"
          appearance="plain"
          :disabled="isOtpSending || isOtpVerifying || null"
          @click="handleSendOtp"
        >
          {{ m['auth.otp_resend_code']() }}
        </wa-button>
        <wa-button
          variant="brand"
          :loading="isOtpVerifying || isSubmitting || null"
          :disabled="isOtpVerifying || isSubmitting || null"
          @click="handleVerifyOtpAndSubmit"
        >
          {{ m['auth.otp_confirm_and_submit']() }}
        </wa-button>
      </Grid>
    </div>
  </wa-dialog>

  <wa-dialog
    id="suggestion-submitted-dialog"
    :label="m['resources.suggestion_submitted_title']()"
    :open="suggestionDialogOpen ? '' : null"
    @wa-after-hide="goToMap"
  >
    <wa-callout variant="success">
      {{ m['resources.suggestion_submitted_msg']() }}
    </wa-callout>
    <div slot="footer" class="dialog-footer">
      <wa-button variant="brand" appearance="plain" @click="goToMap">
        {{ m['resources.suggestion_submitted_action']() }}
      </wa-button>
    </div>
  </wa-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-block-start: var(--wa-space-l);
}
#suggestion-submitted-dialog {
  --width: 60rem;
}
#otp-confirm-dialog {
  --width: 40rem;
}
</style>

