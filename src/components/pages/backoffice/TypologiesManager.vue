<script setup lang="ts">
import { ref } from 'vue'
import { actions } from 'astro:actions'
import '@webawesome/button/button.js'
import '@webawesome/dialog/dialog.js'
import '@webawesome/input/input.js'
import '@webawesome/textarea/textarea.js'
import '@webawesome/icon/icon.js'
import '@webawesome/callout/callout.js'
import '@webawesome/checkbox/checkbox.js'
import Grid from '@/components/ui/Grid.vue'
import type { TypologyRow } from '@/types/database'

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
})

function openEditDialog(typology: TypologyRow) {
  form.value = {
    id: typology.id,
    name: typology.name,
    description: typology.description || '',
    color: typology.color || '#ffffff',
    has_category_color: typology.has_category_color !== false,
  }
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
    const { data, error } = await actions.updateTypology({
      id: form.value.id,
      name: form.value.name,
      description: form.value.description,
      color: form.value.color,
      has_category_color: form.value.has_category_color,
    })

    if (error) {
      console.error('[TypologiesManager] Update typology action error:', error)
      throw error
    }

    if (data?.success && data.typology) {
      const idx = typologies.value.findIndex(t => t.id === data.typology.id)
      if (idx !== -1) {
        typologies.value[idx] = data.typology
      }
      feedback.value = { type: 'success', message: 'Tipologia atualizada com sucesso!' }
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
      <h2>Gestão de tipologias</h2>
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
            <th>Código</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Cor</th>
            <th>Cor nas categorias</th>
            <th class="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="typology in typologies" :key="typology.id">
            <td>
              <span class="badge badge--code">{{ typology.code }}</span>
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
                Editar
              </wa-button>
            </td>
          </tr>
          <tr v-if="typologies.length === 0">
            <td colspan="6" class="text-center">Nenhuma tipologia encontrada.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Dialog -->
    <wa-dialog
      id="typology-dialog"
      label="Editar tipologia"
      :open="dialogOpen ? '' : null"
      @wa-after-hide="closeDialog"
    >
      <form @submit.prevent="saveTypology" class="dialog-form">
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
            placeholder="Nome da tipologia"
          ></wa-input>
        </div>

        <div class="form-group">
          <wa-textarea
            label="Descrição"
            name="description"
            :value="form.description"
            @input="form.description = $event.target.value"
            placeholder="Breve descrição da tipologia"
            rows="3"
          ></wa-textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Cor do pin</label>
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
            <strong>Permitir cor nas categorias</strong>
          </wa-checkbox>
        </div>

        <div slot="footer" class="dialog-footer">
          <wa-button @click="dialogOpen = false">Cancelar</wa-button>
          <wa-button variant="brand" type="submit" :loading="saving">Guardar</wa-button>
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

.badge {
  display: inline-block;
  padding: var(--wa-space-2xs) var(--wa-space-xs);
  font-size: var(--wa-font-size-xs);
  font-weight: var(--wa-font-weight-semibold);
  border-radius: var(--wa-border-radius-pill);
}

.badge--code {
  background-color: var(--wa-color-neutral-200);
  color: var(--wa-color-neutral-800);
  font-family: monospace;
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
