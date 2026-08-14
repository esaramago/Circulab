<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useStore } from '@nanostores/vue'
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/checkbox/checkbox.js'
import '@webawesome/button/button.js'
import '@webawesome/callout/callout.js'
import { $validationDraft, $editingResourceId, clearAddResourceDraft, setStepCompleted } from '@/stores/addResource'
import type { ValidationDraft } from '@/types/add-resource-draft'
import { m } from '@/paraglide/messages.js'

const draft = useStore($validationDraft)
const errorMessage = ref<string>('')

onMounted(() => {
  if ($editingResourceId.get() !== null) {
    clearAddResourceDraft()
  }
})

const handleSubmit = (event: Event) => {
  const isCompleted = draft.value.exists && draft.value.permanent && draft.value.notRepeated
  setStepCompleted('validation', isCompleted)
  if (!isCompleted) {
    event.preventDefault()
    errorMessage.value = m['resources.validation_error']()
  }
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const name = target.name as keyof ValidationDraft
  $validationDraft.set({
    ...$validationDraft.get(),
    [name]: target.checked,
  })
}
</script>

<template>
  <form
    action="/recursos/novo/descricao"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <wa-callout v-if="errorMessage" variant="danger">{{ errorMessage }}</wa-callout>
      <Grid gap="m" direction="column">
        <p>{{ m['resources.validation_conditions']() }}</p>
        <wa-checkbox
          name="exists"
          :checked="draft.exists"
          @change="handleChange"
        >{{ m['resources.validation_exists']() }}</wa-checkbox>
        <wa-checkbox
          name="permanent"
          :checked="draft.permanent"
          @change="handleChange"
        >{{ m['resources.validation_permanent']() }}</wa-checkbox>
        <wa-checkbox
          name="notRepeated"
          :checked="draft.notRepeated"
          @change="handleChange"
        >{{ m['resources.validation_not_repeated']() }}
        </wa-checkbox>
      </Grid>
      <Grid justify="end">
        <wa-button variant="primary" type="submit">{{ m['resources.continue']() }}</wa-button>
      </Grid>
    </Grid>
  </form>
</template>
