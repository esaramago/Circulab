<script setup lang="ts">
import { ref, computed } from 'vue'
import { actions } from 'astro:actions'
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue'
import '@webawesome/button/button.js'
import '@webawesome/dialog/dialog.js'
import '@webawesome/input/input.js'
import '@webawesome/textarea/textarea.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import '@webawesome/icon/icon.js'
import '@webawesome/callout/callout.js'
import Grid from '@/components/ui/Grid.vue'
import type { CategoryRow, TypologyRow } from '@/types/database'

const props = defineProps<{
  initialCategories: CategoryRow[]
  typologies: TypologyRow[]
}>()

const categories = ref<CategoryRow[]>([...props.initialCategories])
const selectedTypologyId = ref('')
const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)

const feedback = ref<{ type: 'success' | 'danger'; message: string } | null>(null)

const form = ref({
  id: '',
  name: '',
  description: '',
  typology_id: '',
})

const categoryToDelete = ref<Category | null>(null)

const filteredCategories = computed(() => {
  if (!selectedTypologyId.value) return []

  const list = categories.value.filter(c => c.typology_id === selectedTypologyId.value)

  return list
})

function getTypologyName(typologyId: string) {
  const typology = props.typologies.find(t => t.id === typologyId)
  return typology ? typology.name : 'Desconhecida'
}

function onTypologyChange(event: any) {
  const val = event.target?.value
  selectedTypologyId.value = val || ''
}

function openCreateDialog() {
  isEditing.value = false
  form.value = {
    id: '',
    name: '',
    description: '',
    typology_id: selectedTypologyId.value || (props.typologies.length > 0 ? props.typologies[0].id : ''),
  }
  feedback.value = null
  dialogOpen.value = true
}

function openEditDialog(category: Category) {
  isEditing.value = true
  form.value = {
    id: category.id,
    name: category.name,
    description: category.description || '',
    typology_id: category.typology_id,
  }
  feedback.value = null
  dialogOpen.value = true
}

async function saveCategory() {
  saving.value = true
  feedback.value = null
  try {
    if (isEditing.value) {
      const { data, error } = await actions.updateCategory({
        id: form.value.id,
        name: form.value.name,
        description: form.value.description,
        typology_id: form.value.typology_id,
      })

      if (error) {
        console.error('[CategoriesManager] Update category action error:', error, error)
        throw error
      }

      if (data?.success && data.category) {
        const idx = categories.value.findIndex(c => c.id === data.category.id)
        if (idx !== -1) {
          categories.value[idx] = data.category
        }
        feedback.value = { type: 'success', message: 'Categoria atualizada com sucesso!' }
        dialogOpen.value = false
      }
    } else {
      const { data, error } = await actions.addCategory({
        name: form.value.name,
        description: form.value.description,
        typology_id: form.value.typology_id,
      })

      if (error) {
        console.error('[CategoriesManager] Add category action error:', error, error)
        throw error
      }

      if (data?.success && data.category) {
        categories.value.unshift(data.category)
        feedback.value = { type: 'success', message: 'Categoria adicionada com sucesso!' }
        dialogOpen.value = false
      }
    }
  } catch (err: any) {
    console.error(err)
    feedback.value = { type: 'danger', message: err.message || 'Ocorreu um erro ao guardar a categoria.' }
  } finally {
    saving.value = false
  }
}

function confirmDelete(category: Category) {
  categoryToDelete.value = category
  feedback.value = null
  deleteDialogOpen.value = true
}

async function deleteCategory() {
  if (!categoryToDelete.value) return
  deleting.value = true
  feedback.value = null
  try {
    const { data, error } = await actions.deleteCategory({ id: categoryToDelete.value.id })
    if (error) throw error

    if (data?.success) {
      categories.value = categories.value.filter(c => c.id !== categoryToDelete.value?.id)
      feedback.value = { type: 'success', message: 'Categoria eliminada com sucesso!' }
      deleteDialogOpen.value = false
    }
  } catch (err: any) {
    console.error(err)
    feedback.value = { type: 'danger', message: err.message || 'Ocorreu um erro ao eliminar a categoria.' }
    deleteDialogOpen.value = false
  } finally {
    deleting.value = false
    categoryToDelete.value = null
  }
}
</script>

<template>
  <Grid direction="column" gap="l">
    <!-- Selection Stage if no typology selected -->
    <div v-if="!selectedTypologyId" class="typology-selector-card">
      <h3>Selecione uma tipologia</h3>
      <p>Selecione uma das tipologias abaixo para ver e gerir as respetivas categorias.</p>
      <wa-select
        placeholder="Selecione uma tipologia..."
        @change="onTypologyChange"
      >
        <wa-option v-for="t in typologies" :key="t.id" :value="t.id">
          {{ t.name }}
        </wa-option>
      </wa-select>
    </div>

    <!-- Full manager if typology is selected -->
    <template v-else>
      <div class="manager__header">
        <div class="header-title-area">
          <h2>Gestão de categorias</h2>
          <wa-select
            size="s"
            :value="selectedTypologyId"
            @change="onTypologyChange"
            class="header-typology-select"
          >
            <wa-option v-for="t in typologies" :key="t.id" :value="t.id">
              {{ t.name }}
            </wa-option>
          </wa-select>
        </div>
        <wa-button variant="primary" @click="openCreateDialog">
          <wa-icon name="plus"></wa-icon>
          Adicionar categoria
        </wa-button>
      </div>

      <!-- Feedback Message -->
      <wa-callout v-if="feedback" :variant="feedback.type" class="manager__feedback">
        {{ feedback.message }}
      </wa-callout>

      <!-- Table -->
      <div class="table-container">
        <table class="manager__table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Tipologia</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in filteredCategories" :key="category.id">
              <td><strong>{{ category.name }}</strong></td>
              <td>{{ category.description || '-' }}</td>
              <td>
                <span class="badge">{{ getTypologyName(category.typology_id) }}</span>
              </td>
              <td class="text-end actions-cell">
                <wa-button size="s" @click="openEditDialog(category)">
                  <wa-icon name="pen"></wa-icon>
                  Editar
                </wa-button>
                <wa-button variant="danger" size="s" @click="confirmDelete(category)">
                  <wa-icon name="trash"></wa-icon>
                  Eliminar
                </wa-button>
              </td>
            </tr>
            <tr v-if="filteredCategories.length === 0">
              <td colspan="4" class="text-center">Nenhuma categoria encontrada para esta tipologia.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Create/Edit Dialog -->
    <wa-dialog
      id="category-dialog"
      :label="isEditing ? 'Editar categoria' : 'Adicionar categoria'"
      :open="dialogOpen ? '' : null"
      @wa-after-hide="dialogOpen = false"
    >
      <form @submit.prevent="saveCategory" class="dialog-form">
        <div class="form-group">
          <wa-input
            label="Nome"
            name="name"
            required
            :value="form.name"
            @input="form.name = $event.target.value"
            placeholder="Nome da categoria"
          ></wa-input>
        </div>

        <div class="form-group">
          <wa-textarea
            label="Descrição"
            name="description"
            :value="form.description"
            @input="form.description = $event.target.value"
            placeholder="Breve descrição da categoria"
            rows="3"
          ></wa-textarea>
        </div>

        <div slot="footer" class="dialog-footer">
          <wa-button @click="dialogOpen = false">Cancelar</wa-button>
          <wa-button variant="brand" type="submit" :loading="saving">Guardar</wa-button>
        </div>
      </form>
    </wa-dialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model:open="deleteDialogOpen"
      title="Confirmar eliminação"
      confirm-label="Eliminar"
      variant="danger"
      :loading="deleting"
      @confirm="deleteCategory"
    >
      <p>Tem a certeza de que deseja eliminar a categoria <strong>{{ categoryToDelete?.name }}</strong>?</p>
      <p class="text-danger"><small>Esta ação não pode ser desfeita.</small></p>
    </ConfirmationDialog>
  </Grid>
</template>

<style scoped>
.manager__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--wa-space-m);
}

.header-title-area {
  display: flex;
  align-items: center;
  gap: var(--wa-space-m);
}

.header-typology-select {
  width: 15rem;
}

.typology-selector-card {
  max-width: 32rem;
  margin: var(--wa-space-xl) auto;
  padding: var(--wa-space-l);
  border: 1px solid var(--wa-color-neutral-200);
  border-radius: var(--wa-border-radius-m);
  background-color: var(--wa-color-neutral-0);
  text-align: center;
  box-shadow: var(--wa-shadow-s);
}

.typology-selector-card h3 {
  margin-block-start: 0;
  margin-block-end: var(--wa-space-s);
}

.typology-selector-card p {
  margin-block-start: 0;
  margin-block-end: var(--wa-space-m);
  color: var(--wa-color-neutral-600);
  font-size: var(--wa-font-size-s);
}

.manager__header h2 {
  margin: 0;
}

.manager__feedback {
  margin-block-end: var(--wa-space-s);
}

.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--wa-color-neutral-200);
  border-radius: var(--wa-border-radius-m);
}

.manager__table {
  width: 100%;
  border-collapse: collapse;
  text-align: start;
}

.manager__table th,
.manager__table td {
  padding: var(--wa-space-m);
  border-block-end: 1px solid var(--wa-color-neutral-200);
}

.manager__table th {
  background-color: var(--wa-color-neutral-50);
  font-weight: var(--wa-font-weight-semibold);
  color: var(--wa-color-neutral-700);
}

.manager__table tbody tr:last-child td {
  border-block-end: none;
}

.manager__table tbody tr:hover {
  background-color: var(--wa-color-neutral-100);
}

.badge {
  display: inline-block;
  padding: var(--wa-space-2xs) var(--wa-space-xs);
  font-size: var(--wa-font-size-xs);
  font-weight: var(--wa-font-weight-semibold);
  border-radius: var(--wa-border-radius-pill);
  background-color: var(--wa-color-brand-90);
  color: var(--wa-color-brand-20);
}

.text-end {
  text-align: end;
}

.text-center {
  text-align: center;
  color: var(--wa-color-neutral-500);
  padding-block: var(--wa-space-xl);
}

.text-danger {
  color: var(--wa-color-danger-60);
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: var(--wa-space-xs);
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-m);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--wa-space-s);
  margin-block-start: var(--wa-space-l);
}
</style>
