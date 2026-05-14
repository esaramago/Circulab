<template>
  <div class="c-gallery__item">
    <button type="button" class="c-gallery__image">
      <img :src="src" :alt="alt" />
    </button>
    <wa-button variant="neutral" appearance="plain" class="c-gallery__remove" @click="removeImage">
      <wa-icon name="times" label="Remover"></wa-icon>
    </wa-button>
  </div>
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
  max-width: 100%;
  height: 12rem;
  box-shadow: var(--wa-shadow-sm);
}
.c-gallery__image {
  position: relative;
  z-index: 1;
  aspect-ratio: 3/2;
  overflow: hidden;
  background-color: var(--wa-color-neutral-20);
  border-radius: var(--wa-border-radius-m);
  border: 1px solid var(--wa-color-neutral-20);
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.1);
    & {
      z-index: 2;
    }
  }
  > img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: center;
  }
}
.c-gallery__remove {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
  z-index: 2;
}
</style>