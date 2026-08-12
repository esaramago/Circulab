<script setup lang="ts">
import { ref } from 'vue'
import { actions } from 'astro:actions'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue'
import geojson from '@/utils/geojson'
import '@webawesome/button/button.js'
import '@webawesome/icon/icon.js'
import '@webawesome/callout/callout.js'
import '@webawesome/card/card.js'
import { localizeHref } from '@/paraglide/runtime.js'
import { clearAddResourceDraft } from '@/stores/addResource'
import type { FullResource } from '@/types/domain/resource'
import { onMounted } from 'vue'

const resources = ref<FullResource[]>([])

onMounted(async () => {
  await getResources()
})

async function getResources() {
  const { data, error } = await actions.getFullResources()
  if (error) {
    console.error(error)
  } else {
    resources.value = data as FullResource[]
  }
}
  

const deleteDialogOpen = ref(false)
const resourceToDelete = ref<FullResource | null>(null)
const deleting = ref(false)
const feedback = ref<{ type: 'success' | 'danger'; message: string } | null>(null)

function confirmDelete(resource: FullResource) {
  resourceToDelete.value = resource
  feedback.value = null
  deleteDialogOpen.value = true
}

async function handleDelete() {
  if (!resourceToDelete.value) return
  deleting.value = true
  feedback.value = null

  try {
    const { data, error } = await actions.deleteResource({ id: resourceToDelete.value.id })
    if (error) throw error

    if (data?.success) {
      
      feedback.value = { type: 'success', message: 'Recurso apagado com sucesso!' }
      deleteDialogOpen.value = false
    }
  } catch (err: any) {
    console.error('[ResourcesDashboardTable] Error deleting resource:', err)
    feedback.value = {
      type: 'danger',
      message: err.message || 'Ocorreu um erro ao apagar o recurso.'
    }
    deleteDialogOpen.value = false
  } finally {
    deleting.value = false
    resourceToDelete.value = null
  }
}
</script>

<template>
  <div>
    <wa-callout v-if="feedback" :variant="feedback.type">
      {{ feedback.message }}
    </wa-callout>

    <div class="card-container">
      <wa-card v-for="resource in resources" :key="resource.id">
        <div slot="header">
          <h2>{{ resource.title }}</h2>
          {{ resource.typology }}
          {{ resource.category }}
        </div>
        <div>
          <p>{{ resource.description }}</p>
          <ul>
            <li>{{ resource.address }}</li>
            <li>{{ resource.email }}</li>
            <li>{{ resource.phone }}</li>
            <li>{{ geojson.getLatitude(resource.coordinates)}}, {{ geojson.getLongitude(resource.coordinates) }}</li>
            <li>{{ resource.accessibility }}</li>
            <li>{{ resource.status }}</li>
            <li>{{ resource.location }}</li>
            <li>{{ resource.postal_code }}</li>
            <li>{{ resource.phone_area_code }}</li>
          </ul>
        </div>
        <div slot="footer">
          <wa-button variant="primary" :href="localizeHref(`/recursos/editar/descricao?id=${resource.id}`)" @click="clearAddResourceDraft">
            <wa-icon name="pen"></wa-icon>
            Editar
          </wa-button>
          <wa-button variant="danger" @click="confirmDelete(resource)">
            <wa-icon name="trash"></wa-icon>
            Apagar
          </wa-button>
        </div>
      </wa-card>
    </div>

    <ConfirmationDialog
      v-model:open="deleteDialogOpen"
      title="Confirmar eliminação"
      confirm-label="Apagar"
      variant="danger"
      :loading="deleting"
      @confirm="handleDelete"
    >
      <p>Tem a certeza de que deseja apagar o recurso <strong>{{ resourceToDelete?.title }}</strong>?</p>
      <p class="u-color-danger"><small>Esta ação não pode ser desfeita.</small></p>
    </ConfirmationDialog>
  </div>
</template>

<style scoped>
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--wa-space-m);
}
</style>
