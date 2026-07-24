<script setup lang="ts">
import { ref } from 'vue'
import { actions } from 'astro:actions'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue'
import geojson from '@/utils/geojson'
import type { ResourceRow } from '@/types/database'
import '@webawesome/button/button.js'
import '@webawesome/icon/icon.js'
import '@webawesome/callout/callout.js'
import { localizeHref } from '@/paraglide/runtime.js'
import { clearAddResourceDraft } from '@/stores/addResource'

const props = defineProps<{
  initialResources: ResourceRow[]
}>()

const resources = ref<ResourceRow[]>([...props.initialResources])
const deleteDialogOpen = ref(false)
const resourceToDelete = ref<ResourceRow | null>(null)
const deleting = ref(false)
const feedback = ref<{ type: 'success' | 'danger'; message: string } | null>(null)

function confirmDelete(resource: ResourceRow) {
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
      resources.value = resources.value.filter(r => r.id !== resourceToDelete.value?.id)
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
  <div class="resources-table-wrapper">
    <wa-callout v-if="feedback" :variant="feedback.type" class="table-feedback">
      {{ feedback.message }}
    </wa-callout>

    <div class="table-container">
      <table class="dashboard-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Imagem</th>
            <th>Categoria</th>
            <th>Características</th>
            <th>Localização</th>
            <th>Endereço</th>
            <th>Código Postal</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Coordenadas</th>
            <th>Estado</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resource in resources" :key="resource.id">
            <td><strong>{{ resource.title }}</strong></td>
            <td>{{ resource.description || '-' }}</td>
            <td>{{ Array.isArray(resource.images) ? resource.images.join(', ') : resource.images || '-' }}</td>
            <td>{{ resource.category_id || '-' }}</td>
            <td>{{ resource.characteristics_ids?.join(', ') || '-' }}</td>
            <td>{{ resource.locations?.name || '-' }}</td>
            <td>{{ resource.locations?.address || '-' }}</td>
            <td>{{ resource.locations?.postal_code || '-' }}</td>
            <td>{{ resource.locations?.email || '-' }}</td>
            <td>{{ resource.locations?.phone || '-' }}</td>
            <td>
              <template v-if="resource.get_geojson">
                {{ geojson.getLatitude(resource.get_geojson) }}, {{ geojson.getLongitude(resource.get_geojson) }}
              </template>
              <template v-else>-</template>
            </td>
            <td>{{ resource.status || '-' }}</td>
            <td class="text-end actions-cell">
              <wa-button size="s" variant="primary" :href="localizeHref(`/recursos/editar/descricao?id=${resource.id}`)" @click="clearAddResourceDraft">
                <wa-icon name="pen"></wa-icon>
                Editar
              </wa-button>
              <wa-button size="s" variant="danger" @click="confirmDelete(resource)">
                <wa-icon name="trash"></wa-icon>
                Apagar
              </wa-button>
            </td>
          </tr>
          <tr v-if="resources.length === 0">
            <td colspan="13" class="text-center">Nenhum recurso encontrado.</td>
          </tr>
        </tbody>
      </table>
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
      <p class="text-danger"><small>Esta ação não pode ser desfeita.</small></p>
    </ConfirmationDialog>
  </div>
</template>

<style scoped>
.resources-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-m);
  margin-block-start: var(--wa-space-m);
}

.table-feedback {
  margin-block-end: var(--wa-space-s);
}

.table-container {
  overflow-x: auto;
}

.dashboard-table {
  width: 100%;
  border-collapse: collapse;
}

.dashboard-table th,
.dashboard-table td {
  padding-block: var(--wa-space-s);
  padding-inline: var(--wa-space-m);
  text-align: start;
  border-block-end: 1px solid var(--wa-color-neutral-border);
}

.dashboard-table th {
  font-weight: var(--wa-font-weight-semibold);
  background-color: var(--wa-color-neutral-subtle);
}

.actions-cell {
  white-space: nowrap;
  display: flex;
  justify-content: flex-end;
  gap: var(--wa-space-xs);
}

.text-end {
  text-align: end;
}

.text-center {
  text-align: center;
}

.text-danger {
  color: var(--wa-color-danger-text, #dc2626);
}
</style>
