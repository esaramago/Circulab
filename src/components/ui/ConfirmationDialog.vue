<script setup lang="ts">
import '@webawesome/dialog/dialog.js'
import '@webawesome/button/button.js'

withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'primary' | 'danger' | 'brand' | 'warning' | 'success' | 'neutral'
    loading?: boolean
    lightDismiss?: boolean
  }>(),
  {
    title: 'Confirmar ação',
    message: '',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    variant: 'primary',
    loading: false,
    lightDismiss: false,
  }
)

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function handleAfterHide() {
  emit('update:open', false)
}

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('update:open', false)
  emit('cancel')
}
</script>

<template>
  <wa-dialog
    :label="title"
    :open="open ? '' : null"
    :light-dismiss="lightDismiss ? '' : null"
    @wa-after-hide="handleAfterHide"
  >
    <slot>
      <p v-if="message">{{ message }}</p>
    </slot>
    <div slot="footer" class="dialog-footer">
      <wa-button @click="handleCancel">{{ cancelLabel }}</wa-button>
      <wa-button :variant="variant" :loading="loading" @click="handleConfirm">
        {{ confirmLabel }}
      </wa-button>
    </div>
  </wa-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--wa-space-s);
  margin-block-start: var(--wa-space-l);
}
</style>
