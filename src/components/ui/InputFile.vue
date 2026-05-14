<template>
  <div class="c-input-file">
    <label :for="id">
      <span :class="{ 'is-visually-hidden': hiddenLabel }">{{ label }}</span>
      <div class="c-input-file__dropzone">
        <Icon name="upload" size="xl"></Icon>
        <slot name="label"></slot>
      </div>
    </label>
    <input ref="inputRef" :id="id" type="file" @change="handleImagesChange" v-bind="$attrs">
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'
const props = defineProps<{
  label: string
  hiddenLabel?: boolean
  id: string
  filesNumber?: number
}>()

const emit = defineEmits<{
  (e: 'change', files: FileList): void
}>()

const handleImagesChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    emit('change', files)
  }
}

</script>

<style scoped>
label {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-xs);
  cursor: pointer;
}
input {
  display: none;
}
.c-input-file__dropzone {
  display: flex;
  min-height: 12rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--wa-space-s);
  border: 1px dashed var(--wa-color-neutral-50);
  border-radius: var(--wa-border-radius-m);
  padding: var(--wa-space-m) var(--wa-space-s);
  box-sizing: border-box;
  color: var(--wa-color-neutral-70);
  text-align: center;
  font-size: var(--wa-font-size-s);
}
</style>