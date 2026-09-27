<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import '@webawesome/dialog/dialog.js'
import '@webawesome/button/button.js'
import Icon from '@/components/ui/Icon.vue'
import { m } from '@/paraglide/messages.js'

const props = withDefaults(
  defineProps<{
    open: boolean
    file: File | null
    current?: number
    total?: number
  }>(),
  {
    open: false,
    file: null,
    current: 1,
    total: 1,
  }
)

const emit = defineEmits<{
  (e: 'crop', file: File): void
  (e: 'cancel'): void
}>()

const imageSrc = ref<string>('')
const imgRef = ref<HTMLImageElement | null>(null)
const cropperContainerRef = ref<HTMLDivElement | null>(null)
const isProcessing = ref(false)
const isReady = ref(false)
const isDialogShown = ref(false)
let cropperInstance: any = null
let resizeObserver: ResizeObserver | null = null

const modalTitle = computed(() => {
  if (props.total > 1) {
    return `${m['resources.crop_image_title']()} (${m['resources.crop_image_progress']({
      current: props.current,
      total: props.total,
    })})`
  }
  return m['resources.crop_image_title']()
})

function cleanupCropper() {
  if (cropperInstance) {
    try {
      cropperInstance.destroy()
    } catch {
      // Ignore cleanup error if already detached
    }
    cropperInstance = null
  }
  if (imageSrc.value) {
    URL.revokeObjectURL(imageSrc.value)
    imageSrc.value = ''
  }
  isReady.value = false
}

async function initCropper() {
  if (!imgRef.value || !imageSrc.value || !cropperContainerRef.value) return

  const rect = cropperContainerRef.value.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    return
  }

  isReady.value = false

  try {
    const { default: Cropper } = await import('cropperjs')
    if (cropperInstance) {
      cropperInstance.destroy()
      cropperInstance = null
    }

    cropperInstance = new Cropper(imgRef.value, {
      template: `
        <cropper-canvas background>
          <cropper-image initial-fit="contain" rotatable scalable translatable></cropper-image>
          <cropper-shade></cropper-shade>
          <cropper-selection aspect-ratio="1" initial-coverage="0.8" movable resizable>
            <cropper-grid role="grid" bordered covered></cropper-grid>
            <cropper-crosshair centered></cropper-crosshair>
            <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>
            <cropper-handle action="n-resize"></cropper-handle>
            <cropper-handle action="e-resize"></cropper-handle>
            <cropper-handle action="s-resize"></cropper-handle>
            <cropper-handle action="w-resize"></cropper-handle>
            <cropper-handle action="ne-resize"></cropper-handle>
            <cropper-handle action="nw-resize"></cropper-handle>
            <cropper-handle action="se-resize"></cropper-handle>
            <cropper-handle action="sw-resize"></cropper-handle>
          </cropper-selection>
        </cropper-canvas>
      `,
    })

    const cropperImage = cropperInstance.getCropperImage()
    const selection = cropperInstance.getCropperSelection()

    if (cropperImage) {
      await cropperImage.$ready()
      await nextTick()
      cropperImage.$center('contain')
    }
    if (selection) {
      selection.$center()
    }
    isReady.value = true
  } catch (err) {
    console.error('Failed to initialize Cropper:', err)
  }
}

function handleDialogAfterShow() {
  isDialogShown.value = true
  initCropper()
}

function handleDialogAfterHide() {
  isDialogShown.value = false
  cleanupCropper()
  emit('cancel')
}

watch(
  () => [props.open, props.file] as const,
  async ([isOpen, file]) => {
    if (isOpen && file) {
      cleanupCropper()
      await nextTick()
      imageSrc.value = URL.createObjectURL(file)
      if (isDialogShown.value) {
        await nextTick()
        initCropper()
      }
    } else if (!isOpen) {
      cleanupCropper()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (typeof window !== 'undefined' && window.ResizeObserver && cropperContainerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          if (!cropperInstance && imageSrc.value && isDialogShown.value) {
            initCropper()
          } else if (cropperInstance && isReady.value) {
            const cropperImage = cropperInstance.getCropperImage()
            const selection = cropperInstance.getCropperSelection()
            if (cropperImage) {
              cropperImage.$center('contain')
            }
            if (selection) {
              selection.$center()
            }
          }
        }
      }
    })
    resizeObserver.observe(cropperContainerRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  cleanupCropper()
})

function handleZoom(delta: number) {
  const cropperImage = cropperInstance?.getCropperImage()
  if (cropperImage) {
    cropperImage.$zoom(delta)
  }
}

function handleRotate() {
  const cropperImage = cropperInstance?.getCropperImage()
  if (cropperImage) {
    cropperImage.$rotate('90deg')
  }
}

async function handleCrop() {
  if (isProcessing.value || !cropperInstance || !props.file) return
  isProcessing.value = true

  try {
    const selection = cropperInstance.getCropperSelection()
    const cropperImage = cropperInstance.getCropperImage()
    if (!selection) {
      throw new Error('Selection not found')
    }

    // Determine target size (max 1080x1080)
    let targetSize = 1080
    if (cropperImage) {
      const transform = cropperImage.$getTransform()
      const a = transform?.[0]
      if (a) {
        const naturalSelectedSize = Math.round(selection.width / Math.abs(a))
        targetSize = Math.min(1080, Math.max(1, naturalSelectedSize))
      }
    }

    const canvas = await selection.$toCanvas({ width: targetSize, height: targetSize })

    // Optimize in terms of KB: convert canvas to WebP with fallback to JPEG at quality 0.82
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b: Blob | null) => {
        if (b) {
          resolve(b)
        } else {
          canvas.toBlob((fallbackB: Blob | null) => {
            if (fallbackB) resolve(fallbackB)
            else reject(new Error('Failed to convert canvas to blob'))
          }, 'image/jpeg', 0.82)
        }
      }, 'image/webp', 0.82)
    })

    const originalName = props.file.name || 'image'
    const baseName = originalName.replace(/\.[^/.]+$/, '')
    const extension = blob.type === 'image/webp' ? 'webp' : 'jpg'
    const croppedFile = new File([blob], `${baseName}.${extension}`, { type: blob.type })

    cleanupCropper()
    emit('crop', croppedFile)
  } catch (err) {
    console.error('Failed to crop and optimize image:', err)
  } finally {
    isProcessing.value = false
  }
}

function handleCancel() {
  cleanupCropper()
  emit('cancel')
}
</script>

<template>
  <wa-dialog
    :label="modalTitle"
    :open="open ? '' : null"
    @wa-after-show="handleDialogAfterShow"
    @wa-after-hide="handleDialogAfterHide"
  >
    <div class="crop-body">
      <p class="crop-instructions">{{ m['resources.crop_image_instructions']() }}</p>

      <div ref="cropperContainerRef" class="crop-container">
        <img
          v-if="imageSrc"
          ref="imgRef"
          :src="imageSrc"
          alt="Image preview"
          class="crop-image"
          @load="initCropper"
        >
      </div>

      <div class="crop-toolbar">
        <wa-button
          variant="neutral"
          appearance="outlined"
          size="s"
          type="button"
          :disabled="!isReady || isProcessing || null"
          @click="handleZoom(0.1)"
        >
          <Icon name="plus" size="s"></Icon>
          {{ m['resources.crop_image_zoom_in']() }}
        </wa-button>
        <wa-button
          variant="neutral"
          appearance="outlined"
          size="s"
          type="button"
          :disabled="!isReady || isProcessing || null"
          @click="handleZoom(-0.1)"
        >
          <Icon name="minus" size="s"></Icon>
          {{ m['resources.crop_image_zoom_out']() }}
        </wa-button>
        <wa-button
          variant="neutral"
          appearance="outlined"
          size="s"
          type="button"
          :disabled="!isReady || isProcessing || null"
          @click="handleRotate"
        >
          <Icon name="rotate" size="s"></Icon>
          {{ m['resources.crop_image_rotate']() }}
        </wa-button>
      </div>
    </div>

    <div slot="footer" class="crop-footer">
      <wa-button
        variant="neutral"
        appearance="outlined"
        type="button"
        :disabled="isProcessing || null"
        @click="handleCancel"
      >
        {{ m['resources.crop_image_cancel']() }}
      </wa-button>
      <wa-button
        variant="brand"
        type="button"
        :loading="isProcessing || null"
        :disabled="!isReady || isProcessing || null"
        @click="handleCrop"
      >
        {{ m['resources.crop_image_confirm']() }}
      </wa-button>
    </div>
  </wa-dialog>
</template>

<style scoped>
wa-dialog {
  --width: min(90vw, 36rem);
}

.crop-body {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-s);
}

.crop-instructions {
  color: var(--wa-color-neutral-70);
  font-size: var(--wa-font-size-s);
  margin-block: 0 var(--wa-space-xs);
}

.crop-container {
  position: relative;
  width: 100%;
  height: 380px;
  background-color: var(--wa-color-neutral-95);
  border-radius: var(--wa-border-radius-m);
  overflow: hidden;
}

.crop-image {
  display: none;
}

.crop-container :deep(cropper-canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.crop-toolbar {
  display: flex;
  gap: var(--wa-space-s);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-block-start: var(--wa-space-xs);
}

.crop-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--wa-space-s);
  margin-block-start: var(--wa-space-m);
}
</style>
