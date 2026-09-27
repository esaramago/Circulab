<script setup lang="ts">
import { ref } from 'vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import InputFile from '@/components/ui/InputFile.vue'
import Gallery from '@/components/ui/Gallery.vue'
import GalleryItem from '@/components/ui/GalleryItem.vue'
import Grid from '@/components/ui/Grid.vue'
import ImageCropperModal from '@/components/ui/ImageCropperModal.vue'
import type { DescriptionImageDraft } from '@/types/add-resource-draft'
import { saveImage, deleteImage } from '@/utils/imageStore'
import { m } from '@/paraglide/messages.js'

const props = defineProps<{
  images: DescriptionImageDraft[]
}>()

const emit = defineEmits<{
  change: [images: DescriptionImageDraft[]]
}>()

const fileQueue = ref<File[]>([])
const currentQueueIndex = ref(0)
const isCropperOpen = ref(false)
const currentFileToCrop = ref<File | null>(null)

const handleImagesChange = (files: FileList) => {
  if (!files || files.length === 0) return
  fileQueue.value = Array.from(files)
  currentQueueIndex.value = 0
  currentFileToCrop.value = fileQueue.value[0]
  isCropperOpen.value = true
}

const handleCroppedImage = async (croppedFile: File) => {
  const id = crypto.randomUUID()
  const url = URL.createObjectURL(croppedFile)
  await saveImage(id, croppedFile)
  const next = [...props.images, {
    id,
    url,
    alt: croppedFile.name || '',
  }]
  emit('change', next)

  currentQueueIndex.value++
  if (currentQueueIndex.value < fileQueue.value.length) {
    currentFileToCrop.value = fileQueue.value[currentQueueIndex.value]
  } else {
    isCropperOpen.value = false
    currentFileToCrop.value = null
    fileQueue.value = []
  }
}

const handleCropperCancel = () => {
  isCropperOpen.value = false
  currentFileToCrop.value = null
  fileQueue.value = []
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

    <ImageCropperModal
      :open="isCropperOpen"
      :file="currentFileToCrop"
      :current="currentQueueIndex + 1"
      :total="fileQueue.length"
      @crop="handleCroppedImage"
      @cancel="handleCropperCancel"
    />
  </Grid>
</template>
