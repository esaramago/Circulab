<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { actions } from 'astro:actions'
import { supabase } from '@/utils/supabase'
import { CONFIG } from '@/config'
import '@webawesome/button/button.js'
import '@webawesome/dialog/dialog.js'
import '@webawesome/input/input.js'
import '@webawesome/textarea/textarea.js'
import '@webawesome/icon/icon.js'
import '@webawesome/callout/callout.js'
import '@webawesome/checkbox/checkbox.js'
import Grid from '@/components/ui/Grid.vue'
import type { TypologyRow } from '@/types/database'
import { m } from '@/paraglide/messages.js'

const props = defineProps<{
  initialTypologies: TypologyRow[]
}>()

const typologies = ref<TypologyRow[]>([...props.initialTypologies])
const dialogOpen = ref(false)
const saving = ref(false)

const feedback = ref<{ type: 'success' | 'danger'; message: string } | null>(null)
const dialogError = ref<string | null>(null)

const form = ref({
  id: '',
  name: '',
  description: '',
  color: '',
  has_category_color: true,
  icon: '',
})

const selectedFile = ref<File | null>(null)
const selectedFileUrl = ref<string | null>(null)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    const { data: sessionData, error: sessionError } = await actions.getSession()
    if (sessionError) {
      console.error('[TypologiesManager] Failed to get session:', sessionError)
      return
    }
    if (sessionData) {
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      })
      if (setSessionError) {
        console.error('[TypologiesManager] Failed to set session:', setSessionError)
      }
    }
  }
})

function isUrlIcon(icon?: string | null): boolean {
  if (!icon) return false
  return icon.includes('/') || icon.endsWith('.svg') || icon.startsWith('http')
}

function clearIcon() {
  form.value.icon = ''
  selectedFile.value = null
  selectedFileUrl.value = null
}

function onFileChange(event: any) {
  const file = event.target?.files?.[0]
  if (file) {
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
    if (isSvg) {
      selectedFile.value = file
      selectedFileUrl.value = URL.createObjectURL(file)
      dialogError.value = null
    } else {
      dialogError.value = m['backoffice.invalid_svg']()
      selectedFile.value = null
      selectedFileUrl.value = null
    }
  }
}

function openEditDialog(typology: TypologyRow) {
  form.value = {
    id: typology.id,
    name: typology.name,
    description: typology.description || '',
    color: typology.color || '#ffffff',
    has_category_color: typology.has_category_color !== false,
    icon: typology.icon || '',
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

async function saveTypology() {
  saving.value = true
  dialogError.value = null
  feedback.value = null
  try {
    let iconPath = form.value.icon

    if (selectedFile.value) {
      const file = selectedFile.value
      const extension = 'svg'
      const filename = `${crypto.randomUUID()}.${extension}`
      const path = `typology-icons/${filename}`

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

    const { data, error } = await actions.updateTypology({
      id: form.value.id,
      name: form.value.name,
      description: form.value.description,
      color: form.value.color,
      has_category_color: form.value.has_category_color,
      icon: iconPath,
    })

    console.log('[TypologiesManager] Action response:', { data, error })

    if (error) {
      console.error('[TypologiesManager] Update typology action error:', error)
      throw error
    }

    if (data?.success && data.typology) {
      const idx = typologies.value.findIndex(t => t.id === data.typology.id)
      if (idx !== -1) {
        typologies.value[idx] = data.typology
      }
      feedback.value = { type: 'success', message: m['backoffice.typology_updated']() }
      dialogOpen.value = false
    }
  } catch (err: any) {
    console.error(err)
    dialogError.value = err.message || 'Ocorreu um erro ao guardar a tipologia.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Grid direction="column" gap="l">
    <div class="manager__header">
      <h2>{{ m['backoffice.manage_typologies_title']() }}</h2>
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
            <th>{{ m['backoffice.icon']() }}</th>
            <th>{{ m['backoffice.name']() }}</th>
            <th>{{ m['backoffice.description']() }}</th>
            <th>{{ m['backoffice.color']() }}</th>
            <th>{{ m['backoffice.color_in_categories']() }}</th>
            <th class="text-end">{{ m['backoffice.actions']() }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="typology in typologies" :key="typology.id">
            <td>
              <wa-icon
                v-if="typology.icon"
                class="typology-icon-preview"
                :src="isUrlIcon(typology.icon) ? CONFIG.images_url + 'pin-images/' + typology.icon : undefined"
                :name="!isUrlIcon(typology.icon) ? typology.icon : undefined"
              ></wa-icon>
              <span v-else class="no-icon">-</span>
            </td>
            <td><strong>{{ typology.name }}</strong></td>
            <td>{{ typology.description || '-' }}</td>
            <td>
              <div class="color-preview-cell">
                <span 
                  class="color-dot" 
                  :style="{ backgroundColor: typology.color || 'var(--wa-color-neutral-300)' }"
                ></span>
                <span class="color-text">{{ typology.color || '-' }}</span>
              </div>
            </td>
            <td>
              <wa-icon v-if="typology.has_category_color" name="check" style="color: var(--wa-color-success-50);"></wa-icon>
              <wa-icon v-else name="xmark" style="color: var(--wa-color-neutral-400);"></wa-icon>
            </td>
            <td class="text-end actions-cell">
              <wa-button size="s" @click="openEditDialog(typology)">
                <wa-icon name="pen"></wa-icon>
                {{ m['map.edit']() }}
              </wa-button>
            </td>
          </tr>
          <tr v-if="typologies.length === 0">
            <td colspan="7" class="text-center">{{ m['backoffice.no_typologies_found']() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Dialog -->
    <wa-dialog
      id="typology-dialog"
      :label="m['backoffice.edit_typology']()"
      :open="dialogOpen ? '' : null"
      @wa-after-hide="closeDialog"
    >
      <form @submit.prevent="saveTypology" class="dialog-form">
        <wa-callout v-if="dialogError" variant="danger">
          {{ dialogError }}
        </wa-callout>

        <div class="form-group">
          <wa-input
            :label="m['backoffice.name']()"
            name="name"
            required
            :value="form.name"
            @input="form.name = $event.target.value"
          ></wa-input>
        </div>

        <div class="form-group">
          <wa-textarea
            :label="m['backoffice.description']()"
            name="description"
            :value="form.description"
            @input="form.description = $event.target.value"
            rows="3"
          ></wa-textarea>
        </div>

        <div class="form-group">
          <label class="form-label">{{ m['backoffice.icon']() }} (SVG)</label>
          <div class="file-upload-wrapper">
            <input
              type="file"
              id="typology-icon-upload"
              accept=".svg"
              @change="onFileChange"
              class="file-input-hidden"
            />
            <label for="typology-icon-upload" class="file-upload-btn">
              <wa-icon name="upload"></wa-icon>
              <span>{{ m['backoffice.select_svg']() }}</span>
            </label>
            <div v-if="selectedFile || form.icon" class="file-upload-preview-area">
              <img
                v-if="selectedFileUrl"
                :src="selectedFileUrl"
                class="typology-icon-preview"
                alt="Ícone"
              />
              <wa-icon
                v-else-if="form.icon"
                :src="isUrlIcon(form.icon) ? CONFIG.images_url + 'pin-images/' + form.icon : undefined"
                :name="!isUrlIcon(form.icon) ? form.icon : undefined"
                class="typology-icon-preview"
              ></wa-icon>
              <span class="file-name">{{ selectedFile ? selectedFile.name : form.icon }}</span>
              <wa-button size="s" variant="neutral" @click="clearIcon">
                <wa-icon name="trash"></wa-icon>
              </wa-button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ m['backoffice.color']() }}</label>
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

        <div class="form-group">
          <wa-checkbox
            name="has_category_color"
            :checked="form.has_category_color"
            @change="form.has_category_color = $event.target.checked"
          >
            <strong>{{ m['backoffice.allow_category_color']() }}</strong>
          </wa-checkbox>
        </div>

        <div slot="footer" class="dialog-footer">
          <wa-button @click="dialogOpen = false">{{ m['backoffice.cancel']() }}</wa-button>
          <wa-button variant="brand" type="submit" :loading="saving">{{ m['resources.save']() }}</wa-button>
        </div>
      </form>
    </wa-dialog>
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

.text-end {
  text-align: end;
}

.text-center {
  text-align: center;
  color: var(--wa-color-neutral-500);
  padding-block: var(--wa-space-xl);
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

.form-label {
  font-size: var(--wa-font-size-s);
  font-weight: var(--wa-font-weight-semibold);
  color: var(--wa-color-neutral-700);
  margin-block-end: var(--wa-space-3xs);
}

.file-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-xs);
}

.file-upload-actions {
  display: flex;
  align-items: center;
  gap: var(--wa-space-s);
}

.file-input-hidden {
  display: none;
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

.typology-icon-preview {
  width: 1.5rem;
  height: 1.5rem;
  object-fit: contain;
  display: inline-block;
}

.no-icon {
  color: var(--wa-color-neutral-400);
}

.file-name {
  font-size: var(--wa-font-size-xs);
  color: var(--wa-color-neutral-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--wa-space-s);
  margin-block-start: var(--wa-space-l);
}
</style>
