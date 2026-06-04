<template>
  <Grid gap="s" direction="column">
    <h3 appearance="p">Imagens do pin</h3>
    <Gallery>
      <template v-if="images.length > 0">
        <GalleryItem v-for="image in images" :key="image.id" :src="image.url" :alt="image.alt" @remove="handleRemoveImage" />
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
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import InputFile from '@/components/ui/InputFile.vue'
import Gallery from '@/components/ui/Gallery.vue'
import GalleryItem from '@/components/ui/GalleryItem.vue'
import Grid from '@/components/ui/Grid.vue'
import type { DescriptionImageDraft } from '@/types/add-resource-draft'

const props = defineProps<{
  images: DescriptionImageDraft[]
}>()

const emit = defineEmits<{
  change: [images: DescriptionImageDraft[]]
}>()

const handleImagesChange = (files: FileList) => {
  if (!files) return
  const next = [...props.images]
  for (const file of files) {
    next.push({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      alt: file.name || '',
    })
  }
  emit('change', next)
}

const handleRemoveImage = (image: { src: string, alt: string }) => {
  emit('change', props.images.filter((i) => i.url !== image.src))
}
</script>
