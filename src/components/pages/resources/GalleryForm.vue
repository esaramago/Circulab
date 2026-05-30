<template>
  <Grid gap="s" direction="column">
    <h3 appearance="p">Imagens do pin</h3>
    <Gallery>
      <template v-if="images.length > 0">
        <GalleryItem v-for="image in images" :key="image.src" :src="image.src" :alt="image.alt" @remove="handleRemoveImage" />
      </template>
      <InputFile
        id="images"
        multiple
        label="Imagens do pin"
        hiddenLabel
        accept="image/*"
        :filesNumber="images.length"
        @change="handleImagesChange"
      >
        <template #label>
          <span v-if="images.length > 0">{{ images.length }} imagens adicionadas</span>
          <span v-else>Adicione imagens do pin</span>
        </template>
      </InputFile>
    </Gallery>
  </Grid>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import InputFile from '@/components/ui/InputFile.vue'
import Gallery from '@/components/ui/Gallery.vue'
import GalleryItem from '@/components/ui/GalleryItem.vue'
import Grid from '@/components/ui/Grid.vue'

const images = ref<{
  src: string
  alt: string
}[]>([])

const handleImagesChange = (files: FileList) => {
  if (!files) return
  for (const file of files) {
    images.value.push({
      src: URL.createObjectURL(file),
      alt: file.name || '',
    })
  }
}

const handleRemoveImage = (image: { src: string; alt: string }) => {
  images.value = images.value.filter((i) => i.src !== image.src)
}
</script>