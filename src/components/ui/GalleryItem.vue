<template>
    <li class="c-gallery__item">
      <button type="button" class="c-gallery__image">
        <img :src="src" :alt="alt" />
      </button>
      <wa-button variant="neutral" appearance="plain" class="c-gallery__remove" @click="removeImage">
        <wa-icon name="times" label="Remover"></wa-icon>
      </wa-button>
    </li>
</template>

<script setup lang="ts">
const props = defineProps<{
  src: string
  alt: string
}>()

const emit = defineEmits<{
  (e: 'remove', image: { src: string; alt: string }): void
}>()

const removeImage = () => {
  emit('remove', props)
}
</script>

<style scoped>

.c-gallery__item {
  position: relative;
  aspect-ratio: 3/2;
  border-radius: var(--wa-border-radius-m);
  overflow: hidden;
  border: 1px solid var(--wa-color-neutral-20);
  box-shadow: var(--wa-shadow-sm);
  transition: all 0.3s ease;
  &:hover {
    z-index: 1;
    transform: scale(1.5);
  }
}
.c-gallery__image {
  object-fit: cover;
  object-position: center;
}
.c-gallery__remove {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
  z-index: 1;
}
</style>