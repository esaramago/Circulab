<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from '@nanostores/vue'
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/checkbox/checkbox.js'
import '@webawesome/button/button.js'
import '@webawesome/callout/callout.js'
import { $validationDraft, setStepCompleted } from '@/stores/addResource'
import type { ValidationDraft } from '@/types/add-resource-draft'

const draft = useStore($validationDraft)
const errorMessage = ref<string>('')

const handleSubmit = (event: Event) => {
  const isCompleted = draft.value.exists && draft.value.permanent && draft.value.notRepeated
  setStepCompleted('validation', isCompleted)
  if (!isCompleted) {
    event.preventDefault()
    errorMessage.value = 'Tem de aceitar todas as condições para continuar'
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
        <p>Ao adicionar um novo pin ao mapa, declaro que:</p>
        <wa-checkbox
          name="exists"
          :checked="draft.exists"
          @change="handleChange"
        ><strong>Existe agora</strong>, não é um projeto que acabou</wa-checkbox>
        <wa-checkbox
          name="permanent"
          :checked="draft.permanent"
          @change="handleChange"
        ><strong>É um local permanente</strong>. Não é uma atividade ou evento pontual</wa-checkbox>
        <wa-checkbox
          name="notRepeated"
          :checked="draft.notRepeated"
          @change="handleChange"><strong>Não é um local que já foi adicionado</strong>. Se já existir, edite o pin existente.
        </wa-checkbox>
      </Grid>
      <Grid justify="end">
        <wa-button variant="primary" type="submit">Continuar</wa-button>
      </Grid>
    </Grid>
  </form>
</template>
