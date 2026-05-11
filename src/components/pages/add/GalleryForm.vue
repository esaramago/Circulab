<template>
  <div class="c-gallery-form">
    <ul v-if="images.length > 0">
      <li v-for="image in images" :key="image.url">
        <!-- <img :src="CONFIG.images_url + image.filename" :alt="image.alt" /> -->
        <img :src="image.url" :alt="image.alt" />
      </li>
    </ul>
    <wa-input type="file" name="images" label="Imagens do pin" multiple @change="handleImagesChange"></wa-input>
  </div>
</template>

<script setup lang="ts">
import { CONFIG } from '@/config'
import { ref } from 'vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'

const images = ref<{
  url: string
  alt: string
}[]>([])

const handleImagesChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).value
  if (file) {
    images.value.push({
      url: file,
      alt: '',
    })
  }
}
</script>

<style scoped>
.c-gallery-form {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-xs);
}
</style>