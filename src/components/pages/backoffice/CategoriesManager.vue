<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { actions } from 'astro:actions'
import { supabase } from '@/utils/supabase'
import { CONFIG } from '@/config'
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
  initialSelectedTypologyId?: string
}>()

const categories = ref<CategoryRow[]>([...props.initialCategories])
const selectedTypologyId = ref(props.initialSelectedTypologyId || '')
const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)

const feedback = ref<{ type: 'success' | 'danger'; message: string } | null>(null)
const dialogError = ref<string | null>(null)

const form = ref({
  id: '',
  name: '',
  description: '',
  typology_id: '',
  icon: '',
  color: '',
})

const selectedFile = ref<File | null>(null)
const selectedFileUrl = ref<string | null>(null)

onMounted(async () => {
  // Ensure the client-side supabase client is authenticated with the session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    const { data: sessionData, error: sessionError } = await actions.getSession()
    if (sessionError) {
      console.error('[CategoriesManager] Failed to get session:', sessionError)
      return
    }
    if (sessionData) {
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      })
      if (setSessionError) {
        console.error('[CategoriesManager] Failed to set session:', setSessionError)
      }
    }
  }
})

function onFileChange(event: any) {
  const file = event.target?.files?.[0]
  if (file) {
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
    if (isSvg) {
      selectedFile.value = file
      selectedFileUrl.value = URL.createObjectURL(file)
      dialogError.value = null
    } else {
      dialogError.value = 'Por favor, selecione um ficheiro SVG válido.'
      selectedFile.value = null
      selectedFileUrl.value = null
    }
  }
}

const categoryToDelete = ref<CategoryRow | null>(null)

const filteredCategories = computed(() => {
  if (!selectedTypologyId.value) return []

  const list = categories.value.filter(c => c.typology_id === selectedTypologyId.value)

  return list
})

const selectedTypology = computed(() => {
  return props.typologies.find(t => t.id === selectedTypologyId.value)
})

function getTypologyName(typologyId: string) {
  const typology = props.typologies.find(t => t.id === typologyId)
  return typology ? typology.name : 'Desconhecida'
}

function openCreateDialog() {
  isEditing.value = false
  form.value = {
    id: '',
    name: '',
    description: '',
    typology_id: selectedTypologyId.value || (props.typologies.length > 0 ? props.typologies[0].id : ''),
    icon: '',
    color: '',
  }
  selectedFile.value = null
  selectedFileUrl.value = null
  feedback.value = null
  dialogError.value = null
  dialogOpen.value = true
}

function openEditDialog(category: CategoryRow) {
  isEditing.value = true
  form.value = {
    id: category.id,
    name: category.name,
    description: category.description || '',
    typology_id: category.typology_id,
    icon: category.icon || '',
    color: category.color || '',
  }
  selectedFile.value = null
  selectedFileUrl.value = null
  feedback.value = null
  dialogError.value = null
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  dialogError.value = null
}

async function saveCategory() {
  saving.value = true
  dialogError.value = null
  feedback.value = null
  try {
    let iconPath = form.value.icon

    if (selectedFile.value) {
      const file = selectedFile.value
      const extension = 'svg'
      const filename = `${crypto.randomUUID()}.${extension}`
      const path = `category-icons/${filename}`

      const { error: uploadError } = await supabase.storage
        .from('pin-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
          })

      if (uploadError) {
        throw new Error(`Erro ao carregar o ícone: ${uploadError.message}`)
      }
      iconPath = path
    }

    const hasCategoryColor = selectedTypology.value?.has_category_color !== false
    const finalColor = hasCategoryColor ? (form.value.color || null) : null

    if (isEditing.value) {
      const { data, error } = await actions.updateCategory({
        id: form.value.id,
        name: form.value.name,
        description: form.value.description,
        typology_id: form.value.typology_id,
        icon: iconPath,
        color: finalColor,
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
        icon: iconPath,
        color: finalColor,
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
    dialogError.value = err.message || 'Ocorreu um erro ao guardar a categoria.'
  } finally {
    saving.value = false
  }
}

function confirmDelete(category: CategoryRow) {
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
    <!-- Feedback Message -->
    <wa-callout v-if="feedback" :variant="feedback.type" class="manager__feedback">
      {{ feedback.message }}
    </wa-callout>

    <div class="manager__header">
      <div class="header-title-area">
        <h2>Gestão de categorias &mdash; <span class="typology-title">{{ getTypologyName(selectedTypologyId) }}</span></h2>
      </div>
      <wa-button variant="primary" @click="openCreateDialog">
        <wa-icon name="plus"></wa-icon>
        Adicionar categoria
      </wa-button>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="manager__table">
        <thead>
          <tr>
            <th>Ícone</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th v-if="selectedTypology?.has_category_color !== false">Cor</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in filteredCategories" :key="category.id">
            <td>
              <img v-if="category.icon" class="category-icon-preview" :src="CONFIG.images_url + 'pin-images/' + category.icon" alt="Ícone" />
              <span v-else class="no-icon">-</span>
            </td>
            <td><strong>{{ category.name }}</strong></td>
            <td>{{ category.description || '-' }}</td>
            <td v-if="selectedTypology?.has_category_color !== false">
              <div v-if="category.color" class="color-preview-cell">
                <span 
                  class="color-dot" 
                  :style="{ backgroundColor: category.color }"
                ></span>
                <span class="color-text">{{ category.color }}</span>
              </div>
              <span v-else class="no-icon">-</span>
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
            <td :colspan="selectedTypology?.has_category_color !== false ? 5 : 4" class="text-center">Nenhuma categoria encontrada para esta tipologia.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Dialog -->
    <wa-dialog
      id="category-dialog"
      :label="isEditing ? 'Editar categoria' : 'Adicionar categoria'"
      :open="dialogOpen ? '' : null"
      @wa-after-hide="closeDialog"
    >
      <form @submit.prevent="saveCategory" class="dialog-form">
        <wa-callout v-if="dialogError" variant="danger">
          {{ dialogError }}
        </wa-callout>
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

        <div class="form-group">
          <label class="form-label">Ícone (ficheiro SVG)</label>
          <div class="file-upload-wrapper">
            <input
              type="file"
              id="icon-upload"
              accept=".svg"
              @change="onFileChange"
              class="file-input-hidden"
            />
            <label for="icon-upload" class="file-upload-btn">
              <wa-icon name="upload"></wa-icon>
              <span>Selecionar ficheiro SVG</span>
            </label>
            <div v-if="selectedFile || form.icon" class="file-upload-preview-area">
               <img
                v-if="selectedFileUrl"
                :src="selectedFileUrl"
                class="category-icon-preview"
                alt="Novo ícone"
              />
              <img
                v-else-if="form.icon"
                :src="CONFIG.images_url + 'pin-images/' + form.icon"
                class="category-icon-preview"
                alt="Ícone atual"
              />
              <span class="file-name">{{ selectedFile ? selectedFile.name : 'Ícone atual' }}</span>
            </div>
          </div>
        </div>

        <div class="form-group" v-if="selectedTypology?.has_category_color !== false">
          <label class="form-label">Cor do pin (opcional)</label>
          <div class="color-input-wrapper">
            <input
              type="color"
              :value="form.color || '#ffffff'"
              @input="form.color = $event.target.value"
              class="color-picker"
            />
            <wa-input
              name="color"
              :value="form.color"
              @input="form.color = $event.target.value"
              placeholder="#FFFFFF"
              class="color-text-input"
            ></wa-input>
          </div>
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

.category-icon-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--wa-color-neutral-700);
}

.category-icon-preview :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.no-icon {
  color: var(--wa-color-neutral-400);
  font-style: italic;
}

.form-label {
  font-size: var(--wa-font-size-s);
  font-weight: var(--wa-font-weight-semibold);
  color: var(--wa-color-neutral-700);
  margin-block-end: var(--wa-space-2xs);
}

.file-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-xs);
}

.file-input-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.file-upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--wa-space-xs);
  padding: var(--wa-space-s) var(--wa-space-m);
  border: 1px dashed var(--wa-color-neutral-300);
  border-radius: var(--wa-border-radius-m);
  background-color: var(--wa-color-neutral-50);
  cursor: pointer;
  font-size: var(--wa-font-size-s);
  font-weight: var(--wa-font-weight-medium);
  transition: all 0.2s ease;
}

.file-upload-btn:hover {
  border-color: var(--wa-color-brand-50);
  background-color: var(--wa-color-neutral-100);
}

.file-upload-preview-area {
  display: flex;
  align-items: center;
  gap: var(--wa-space-s);
  padding: var(--wa-space-xs) var(--wa-space-s);
  border: 1px solid var(--wa-color-neutral-200);
  border-radius: var(--wa-border-radius-m);
  background-color: var(--wa-color-neutral-0);
}

.file-name {
  font-size: var(--wa-font-size-xs);
  color: var(--wa-color-neutral-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.color-preview-cell {
  display: flex;
  align-items: center;
  gap: var(--wa-space-xs);
}

.color-dot {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--wa-border-radius-circle);
  border: 1px solid var(--wa-color-neutral-300);
  flex-shrink: 0;
  display: inline-block;
}

.color-text {
  font-family: monospace;
  font-size: var(--wa-font-size-s);
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--wa-space-s);
}

.color-picker {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 3.5rem;
  height: 2.5rem;
  border: 1px solid var(--wa-color-neutral-300);
  border-radius: var(--wa-border-radius-m);
  cursor: pointer;
  background: none;
  padding: 0;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: calc(var(--wa-border-radius-m) - 1px);
}

.color-text-input {
  flex-grow: 1;
}

.typology-title {
  color: var(--wa-color-brand-50);
}
</style>
