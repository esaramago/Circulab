<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import { ref, onMounted } from 'vue'
import { actions } from 'astro:actions'
import { clearAddResourceDraft, getAddResourcePayload } from '@/stores/addResource'
import { supabase } from '@/utils/supabase'
import { getImage, clearImages } from '@/utils/imageStore'
import type { DescriptionDraft, LocationDraft } from '@/types/add-resource-draft'
import '@webawesome/callout/callout.js'

type AddResourcePayload = DescriptionDraft & LocationDraft

const resumeData = ref<AddResourcePayload | null>(null)
const isSubmitting = ref(false)
const errorMessage = ref('')

onMounted(async () => {
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
})

async function handleSubmit() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // 0. Sync client-side supabase session with cookie session
    const { data: sessionData, error: sessionError } = await actions.getSession()
    if (sessionError) {
      throw new Error(`Erro ao obter sessão: ${sessionError.message}`)
    }
    
    let userId = ''
    if (sessionData) {
      const { data: authData, error: setSessionError } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      })
      if (setSessionError) {
        throw new Error(`Erro ao autenticar cliente: ${setSessionError.message}`)
      }
      userId = authData.user?.id || ''
    } else {
      throw new Error('Utilizador não autenticado.')
    }

    const pinId = crypto.randomUUID()
    const uploadedImages: { url: string; alt: string }[] = []

    // 1. Upload files from IndexedDB to Supabase Storage
    const draftImages = resumeData.value?.images || []
    for (const img of draftImages) {
      const blob = await getImage(img.id)
      if (blob) {
        const extension = img.alt.split('.').pop() || 'jpg'
        const path = userId ? `${userId}/${pinId}/${img.id}.${extension}` : `${pinId}/${img.id}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from('pin-images')
          .upload(path, blob, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`Erro ao carregar a imagem: ${uploadError.message}`)
        }

        uploadedImages.push({
          url: path,
          alt: img.alt,
        })
      }
    }

    // 2. Call actions.addResource with pre-generated pin ID and images array
    const { error } = await actions.addResource({
      id: pinId,
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
      images: uploadedImages,
    })

    if (error) {
      throw new Error(error.message || 'Erro ao guardar o recurso.')
    }

    // 3. Clear local storage/IndexedDB on success
    clearAddResourceDraft()
    await clearImages()
    window.location.href = '/'
  } catch (err: any) {
    console.error(err)
    errorMessage.value = err.message || 'Ocorreu um erro ao submeter o recurso.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <wa-callout v-if="errorMessage" variant="danger" style="margin-block-end: var(--wa-space-m);">
    {{ errorMessage }}
  </wa-callout>

  <ul>
    <li>Título: {{ resumeData?.title }}</li>
    <li>Descrição: {{ resumeData?.description }}</li>
    <li>Imagem: {{ resumeData?.images?.length }}</li>
    <li>Tipologia: {{ resumeData?.typology_id }}</li>
    <li>Categoria: {{ resumeData?.category_id }}</li>
    <li>Características: {{ resumeData?.characteristics_ids?.join(', ') }}</li>
    <li>Localização: {{ resumeData?.location_name }}</li>
    <li>Coordenadas: {{ resumeData?.coordinates?.latitude }}, {{ resumeData?.coordinates?.longitude }}</li>
    <li>Morada: {{ resumeData?.address }}</li>
    <li>Código postal: {{ resumeData?.postal_code }}</li>
    <li>Email: {{ resumeData?.email }}</li>
    <li>Telefone: {{ resumeData?.phone_area_code ? `+${resumeData?.phone_area_code}` : '' }} {{ resumeData?.phone }}</li>
  </ul>

  <Grid justify="end">
    <wa-button
      variant="outlined"
      appearance="outlined"
      :disabled="isSubmitting || null"
      href="/recursos/novo/localizacao">Voltar</wa-button
    >
    <wa-button variant="brand" :loading="isSubmitting || null" :disabled="isSubmitting || null" @click="handleSubmit">Adicionar</wa-button>
  </Grid>
</template>
