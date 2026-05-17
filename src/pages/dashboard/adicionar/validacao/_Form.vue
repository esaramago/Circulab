<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/checkbox/checkbox.js'
import '@webawesome/button/button.js'
import '@webawesome/callout/callout.js'

const form = reactive({
  exists: false,
  permanent: false,
  notRepeated: false
})
  
const errorMessage = ref<string>('')

const handleSubmit = (event: Event) => {
  const isCompleted = form.exists && form.permanent && form.notRepeated
  window.localStorage.setItem('circulab:add:validation:completed', isCompleted ? 'true' : 'false')
  if (!isCompleted) {
    event.preventDefault()
    errorMessage.value = 'Tem de aceitar todas as condições para continuar'
  }
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  form[target.name as keyof typeof form] = target.checked
  saveOnLocalStorage()
}

const saveOnLocalStorage = () => {
  const data = {
    exists: form.exists,
    permanent: form.permanent,
    notRepeated: form.notRepeated
  }
  window.localStorage.setItem('circulab:add:validation', JSON.stringify(data))
}

onMounted(() => {
  const validation = JSON.parse(window.localStorage.getItem('circulab:add:validation') || '{}')
  form.exists = validation.exists || false
  form.permanent = validation.permanent || false
  form.notRepeated = validation.notRepeated || false
})
</script>

<template>
  <form
    action="/dashboard/adicionar/descricao"
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
          :checked="form.exists"
          @change="handleChange"
        ><strong>Existe agora</strong>, não é um projeto que acabou</wa-checkbox>
        <wa-checkbox
          name="permanent"
          :checked="form.permanent"
          @change="handleChange"
        ><strong>É um local permanente</strong>. Não é uma atividade ou evento pontual</wa-checkbox>
        <wa-checkbox
          name="notRepeated"
          :checked="form.notRepeated"
          @change="handleChange"><strong>Não é um local que já foi adicionado</strong>. Se já existir, edite o pin existente.
        </wa-checkbox>
      </Grid>
      <Grid justify="end">
        <wa-button variant="primary" type="submit">Continuar</wa-button>
      </Grid>
    </Grid>
  </form>
</template>