<template>
  <ul>
    <li v-for="image in images" :key="image.id">
      <img :src="CONFIG.images_url + image.url" :alt="image.alt" />
    </li>
  </ul>
  <wa-input type="file" name="images" label="Imagens do pin" required></wa-input>
  <wa-button variant="brand" type="submit">Adicionar</wa-button>
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