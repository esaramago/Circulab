<template>
  <div class="c-gallery-form">
    <ul v-if="images.length > 0">
      <li v-for="image in images" :key="image.id">
        <img :src="CONFIG.images_url + image.url" :alt="image.alt" />
      </li>
    </ul>
    <wa-input type="file" name="images" label="Imagens do pin" required></wa-input>
    <wa-button variant="brand" type="submit">Adicionar</wa-button>
  </div>
</template>

<script setup lang="ts">
import { CONFIG } from '@/config'
import { ref } from 'vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'

const images = ref<{
  id: string
  url: string
  alt: string
}[]>([])
</script>

<style scoped>
.c-gallery-form {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-xs);
}
</style>