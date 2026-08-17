
<script setup lang="ts">
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import InputFile from '@/components/ui/InputFile.vue'
import Gallery from '@/components/ui/Gallery.vue'
import GalleryItem from '@/components/ui/GalleryItem.vue'
import Grid from '@/components/ui/Grid.vue'
import type { DescriptionImageDraft } from '@/types/add-resource-draft'
import { saveImage, deleteImage } from '@/utils/imageStore'
import { m } from '@/paraglide/messages.js'

const props = defineProps<{
  images: DescriptionImageDraft[]
}>()

const emit = defineEmits<{
  change: [images: DescriptionImageDraft[]]
}>()

const handleImagesChange = async (files: FileList) => {
  if (!files) return
  const next = [...props.images]
  for (const file of files) {
    const id = crypto.randomUUID()
    const url = URL.createObjectURL(file)
    await saveImage(id, file)
    next.push({
      id,
      url,
      alt: file.name || '',
    })
  }
  emit('change', next)
}

const handleRemoveImage = async (image: { src: string, alt: string }) => {
  const matched = props.images.find((i) => i.url === image.src)
  if (matched) {
    await deleteImage(matched.id)
    emit('change', props.images.filter((i) => i.id !== matched.id))
  } else {
    emit('change', props.images.filter((i) => i.url !== image.src))
  }
}
</script>


<template>
  <Grid gap="s" direction="column">
    <h3 appearance="p">{{ m['resources.images_label']() }}</h3>
    <Gallery>
      <template v-if="images.length > 0">
        <GalleryItem v-for="image in images" :key="image.id" :src="image.url" :alt="image.alt" @remove="handleRemoveImage" :removable="true" />
      </template>
      <InputFile
        id="images"
        multiple
        :label="m['resources.add_images_label']()"
        hiddenLabel
        accept="image/*"
        :filesNumber="images.length"
        @change="handleImagesChange"
      >
        <template #label>
          <span>{{ m['resources.add_images_label']() }}</span>
        </template>
      </InputFile>
    </Gallery>
    <p class="u-text-small">
      <template v-if="images.length === 1">{{ m['resources.image_added_singular']() }}</template>
      <template v-else-if="images.length > 1">{{ m['resources.image_added_plural']({ count: images.length }) }}</template>
    </p>
  </Grid>
</template>
