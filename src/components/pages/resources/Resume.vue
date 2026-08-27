<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import { ref, onMounted, computed } from 'vue'
import { useStore } from '@nanostores/vue'
import { actions } from 'astro:actions'
import { clearAddResourceDraft, getAddResourcePayload, ensureDraftLoaded, $editingResourceId } from '@/stores/addResource'
import { supabase } from '@/utils/supabase'
import { getImage, clearImages } from '@/utils/imageStore'
import type { DescriptionDraft, LocationDraft } from '@/types/add-resource-draft'
import '@webawesome/callout/callout.js'
import '@webawesome/card/card.js'
import { localizeHref } from '@/paraglide/runtime.js'
import { m } from '@/paraglide/messages.js'
import Gallery from '@/components/ui/Gallery.vue'
import GalleryItem from '@/components/ui/GalleryItem.vue'
import OpeningHoursTable from '@/components/pages/resources/OpeningHoursTable.vue'

type AddResourcePayload = DescriptionDraft & LocationDraft

const resumeData = ref<AddResourcePayload | null>(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const editingResourceId = useStore($editingResourceId)
const isEdit = computed(() => !!editingResourceId.value)

const category = ref<string | null>(null)
const typology = ref<string | null>(null)
const characteristics = ref<string | null>(null)

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')
  if (id) {
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
    typology.value = typologyData?.typology?.name ?? null
  }

  if (payload.category_id) {
    const { data: categoryData } = await actions.getCategoryById({ id: payload.category_id })
    category.value = categoryData?.category?.name ?? null
  }

  console.log(category.value)
  console.log(typology.value)
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

    const pinId = isEdit.value ? editingResourceId.value! : crypto.randomUUID()
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
      accessibility: resumeData.value?.accessibility || undefined,
      has_opening_hours: resumeData.value?.has_opening_hours ?? false,
      opening_hours: resumeData.value?.has_opening_hours ? (resumeData.value?.opening_hours || undefined) : undefined,
      networks: resumeData.value?.networks ? resumeData.value.networks.map(n => ({ slug: n.slug, value: n.value })) : undefined,
      images: uploadedImages,
    }

    const { error } = isEdit.value
      ? await actions.editResource(payload)
      : await actions.addResource(payload)

    if (error) {
      throw new Error(error.message || 'Erro ao guardar o recurso.')
    }

    // 3. Clear local storage/IndexedDB on success
    clearAddResourceDraft()
    await clearImages()
    window.location.href = localizeHref('/mapa')
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

  <wa-card>
    <Grid gap="l" direction="column" v-if="resumeData">

      <Gallery>
        <template v-if="resumeData.images?.length > 0">
          <GalleryItem v-for="image in resumeData.images" :key="image.id" :src="image.url" :alt="image.alt" />
        </template>
      </Gallery>
      <div>
        <h2>{{ resumeData.title }}</h2>
        <p>{{ category }} ({{ typology }})</p>
        <p v-if="characteristics">{{ characteristics }}</p>
      </div>

      <Grid gap="xs" direction="column" class="list">
        <div>
          <wa-icon name="location-dot"></wa-icon>
          <template v-if="resumeData.location_name">{{resumeData.location_name}}, </template>{{resumeData.address}},
          {{ resumeData.postal_code }}
        </div>
        <div v-if="resumeData.coordinates">
          <wa-icon name="map"></wa-icon>
          <a
            :href="`https://www.google.com/maps/search/?api=1&query=${resumeData.coordinates?.latitude},${resumeData.coordinates?.longitude}`"
            target="_blank"
            :title="m['map.open_google_maps']()"
          >
            {{ resumeData.coordinates?.latitude }}, {{ resumeData.coordinates?.longitude }}
          </a>
        </div>
        <div v-if="resumeData.email">
          <wa-icon name="at"></wa-icon>
          {{ resumeData.email }}
        </div>
        <div v-if="resumeData.phone">
          <wa-icon name="phone"></wa-icon>
          +{{resumeData.phone_area_code}} {{ resumeData.phone }}
        </div>
        <template v-if="resumeData.networks && resumeData.networks.length > 0">
          <div v-for="net in resumeData.networks" :key="net.slug">
            <wa-icon :name="net.icon || 'link'" :family="net.icon === 'instagram' || net.icon === 'facebook' ? 'brands' : undefined"></wa-icon>
            <a :href="net.value" target="_blank" rel="noopener noreferrer">{{ net.value }}</a>
          </div>
        </template>
        <div v-if="resumeData.accessibility">
          <template v-if="resumeData.accessibility === 'private'">
            <wa-icon name="door-closed" size="sm" class="u-color-danger"></wa-icon>
            <span>{{ m['map.access_limited']() }}</span>
          </template>
          <template v-else-if="resumeData.accessibility === 'public'">
            <wa-icon name="door-open" size="sm" class="u-color-success"></wa-icon>
            <span>{{ m['map.access_public']() }}</span>
          </template>
        </div>
      </Grid>

      <div v-if="resumeData.has_opening_hours" class="schedule-section">
        <strong>{{ m['resources.schedule_heading']() }}</strong>
        <OpeningHoursTable :opening-hours="resumeData.opening_hours" />
      </div>

      <div>
        <strong>{{ m['resources.description_label']() }}</strong>
        <p>{{ resumeData.description }}</p>
      </div>

    </Grid>
  </wa-card>

  <Grid justify="end">
    <wa-button
      variant="outlined"
      appearance="outlined"
      :disabled="isSubmitting || null"
      :href="localizeHref(isEdit ? `/recursos/editar?id=${editingResourceId}` : '/recursos/novo/contactos')">{{ m['resources.back']() }}</wa-button
    >
    <wa-button variant="brand" :loading="isSubmitting || null" :disabled="isSubmitting || null" @click="handleSubmit">
      {{ isEdit ? m['resources.save']() : m['resources.add']() }}
    </wa-button>
  </Grid>
</template>

<style scoped>
.list {
  wa-icon {
    padding-inline-end: var(--wa-space-xs);
  }
}
</style>
