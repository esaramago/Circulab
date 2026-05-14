<template>
  <label :for="id">
    <span>{{ label }}</span>
    <div class="c-input-file__dropzone">
      <Icon name="upload" size="xl"></Icon>
      <span v-if="filesNumber">{{ filesNumber }} imagens adicionadas</span>
      <span v-else>Adicione até 5 imagens</span>
    </div>
  </label>
  <input ref="inputRef" :id="id" type="file" @change="handleImagesChange" v-bind="$attrs">
</template>

<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'
const props = defineProps<{
  label: string
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--wa-space-s);
  width: 15rem;
  aspect-ratio: 3/2;
  border: 1px dashed var(--wa-color-neutral-50);
  border-radius: var(--wa-border-radius-m);
  padding: var(--wa-space-l) var(--wa-space-m);
  box-sizing: border-box;
  color: var(--wa-color-neutral-70);
  text-align: center;
}
</style>