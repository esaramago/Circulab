<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { actions } from 'astro:actions'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue'
import { CONFIG } from '@/config'
import '@webawesome/button/button.js'
import '@webawesome/icon/icon.js'
import '@webawesome/callout/callout.js'
import '@webawesome/card/card.js'
import '@webawesome/input/input.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import { localizeHref } from '@/paraglide/runtime.js'
import { clearAddResourceDraft } from '@/stores/addResource'
import { fetchDB } from '@/utils/fetchDB'
import type { FullResource } from '@/types/domain/resource'
import Grid from '@/components/ui/Grid.vue'
import type { TypologyRow, CategoryRow } from '@/types/database'

const resources = ref<FullResource[]>([])
const typologies = ref<TypologyRow[]>([])
const categories = ref<CategoryRow[]>([])

const search = ref('')
const selectedTypology = ref('')
const selectedCategory = ref('')

onMounted(async () => {
  await getResources()
  await getTypologies()
})

async function getResources() {
  const { data, error } = await actions.getFullResources()
  if (error) {
    console.error(error)
  } else {
    resources.value = data as FullResource[]
  }
}

async function getTypologies() {
  const { data, error } = await fetchDB('typologies').select('*').order('name', { ascending: true })
  if (error) {
    console.error('[ResourcesDashboard] Error fetching typologies:', error)
  } else {
    typologies.value = (data ?? []) as TypologyRow[]
  }
}

async function getCategories(typology_id: string) {

  if (!typology_id) return
  const { data, error } = await actions.getCategories({ typology_id })

  if (error) {
    console.error('[ResourcesDashboard] Error fetching categories:', error)
  } else {
    categories.value = (data.categories ?? []) as CategoryRow[]
  }
}

async function handleTypologyChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newTypologyId = target.value || ''
  selectedTypology.value = newTypologyId
  await getCategories(newTypologyId)
}

function handleCategoryChange(event: Event) {
  const target = event.target as HTMLSelectElement
  selectedCategory.value = target.value || ''
}

function handleSearchInput(event: Event) {
  const target = event.target as HTMLInputElement
  search.value = target.value || ''
}

const filteredResources = computed(() => {
  return resources.value.filter((resource) => {
    if (search.value.trim()) {
      const q = search.value.toLowerCase().trim()
      const titleMatch = resource.title?.toLowerCase().includes(q)
      const descMatch = resource.description?.toLowerCase().includes(q)
      const addressMatch = resource.address?.toLowerCase().includes(q)
      const locationMatch = resource.location?.toLowerCase().includes(q)
      const emailMatch = resource.email?.toLowerCase().includes(q)
      if (!titleMatch && !descMatch && !addressMatch && !locationMatch && !emailMatch) {
        return false
      }
    }

    if (selectedTypology.value && resource.typology_id !== selectedTypology.value) {
      return false
    }

    if (selectedCategory.value && resource.category_id !== selectedCategory.value) {
      return false
    }

    return true
  })
})

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
      await getResources()
    }
  } catch (err: any) {
    console.error('[ResourcesDashboard] Error deleting resource:', err)
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
  <Grid direction="column" gap="l">
    <wa-callout v-if="feedback" :variant="feedback.type">
      {{ feedback.message }}
    </wa-callout>

    <Grid direction="row" gap="s">
      <wa-input
        label="Pesquisar"
        placeholder="Pesquisar..."
        :value="search"
        @input="handleSearchInput"
        with-clear
        @clear="search = ''"
      ></wa-input>
      <wa-select
        label="Tipologia"
        :value="selectedTypology"
        @input="handleTypologyChange"
        with-clear
        @clear="selectedTypology = ''"
      >
        <wa-option value="">Todas</wa-option>
        <wa-option v-for="typology in typologies" :key="typology.id" :value="typology.id">
          {{ typology.name }}
        </wa-option>
      </wa-select>
      <wa-select
        v-if="selectedTypology"
        label="Categoria"
        :value="selectedCategory"
        @input="handleCategoryChange"
        with-clear
        @clear="selectedCategory = ''"
      >
        <wa-option value="">Todas</wa-option>
        <wa-option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </wa-option>
      </wa-select>
    </Grid>

    <div v-if="filteredResources.length > 0" class="card-container">
      <wa-card v-for="resource in filteredResources" :key="resource.id">


        <img v-if="resource?.images?.[0]" slot="media" :src="CONFIG.images_url + 'pin-images/' + resource?.images?.[0].url" :alt="resource?.title" loading="lazy" />

        <div slot="header">
          <h2>{{ resource.title }}</h2>
          <p>{{ resource?.category }} ({{ resource?.typology }})</p>
        </div>
        
        <Grid gap="xs" direction="column">
          <div>
            <wa-icon name="location-dot"></wa-icon>
            <template v-if="resource.location">{{resource.location}}, </template>{{resource.address}},
            {{ resource.postal_code }}
          </div>
          <div v-if="resource?.coordinates">
            <wa-icon name="map"></wa-icon>
            <a
              :href="`https://www.google.com/maps/search/?api=1&query=${resource.coordinates.coordinates[1]},${resource.coordinates.coordinates[0]}`"
              target="_blank"
              title="Abrir no Google Maps"
            >
              {{ resource.coordinates.coordinates[1] }}, {{ resource.coordinates.coordinates[0] }}
            </a>
          </div>
          <div v-if="resource?.email">
            <wa-icon name="at"></wa-icon>
            {{ resource.email }}
          </div>
          <div v-if="resource?.phone">
            <wa-icon name="phone"></wa-icon>
            {{ resource.phone }}
          </div>
          <div v-if="resource?.accessibility">
            <template v-if="resource.accessibility === 'private'">
              <wa-icon name="door-closed" size="sm" class="u-color-danger"></wa-icon>
              <span>Acesso limitado</span>
            </template>
            <template v-else-if="resource.accessibility === 'public'">
              <wa-icon name="door-open" size="sm" class="u-color-success"></wa-icon>
              <span>Acesso livre</span>
            </template>
          </div>
        </Grid>

        <Grid slot="footer" justify="end" gap="s">
          <wa-button size="s" variant="primary" :href="localizeHref(`/recursos/editar?id=${resource.id}`)" @click="clearAddResourceDraft">
            <wa-icon name="pen"></wa-icon>
            Editar
          </wa-button>
          <wa-button size="s" variant="danger" @click="confirmDelete(resource)">
            <wa-icon name="trash"></wa-icon>
            Apagar
          </wa-button>
        </Grid>
      </wa-card>
    </div>
    <div v-else class="empty-state">
      <p>Nenhum recurso encontrado com os filtros selecionados.</p>
    </div>
  </Grid>

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
</template>

<style scoped>
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--wa-space-m);
}

.empty-state {
  padding: var(--wa-space-l);
  text-align: center;
  color: var(--wa-color-neutral-70);
}

wa-card {
  > img {
    object-fit: cover;
    height: 180px;
  }
  &::part(body) {
    flex: 1;
  }
  &::part(footer) {
    padding-block: var(--wa-space-m);
  }
}
</style>

