<script setup lang="ts">
import { ref } from 'vue'
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/checkbox/checkbox.js'
import '@webawesome/button/button.js'
import '@webawesome/callout/callout.js'

defineProps<{
  formAction: string
}>()

const existsChecked = ref<boolean>(false)
const permanentChecked = ref<boolean>(false)
const notRepeatedChecked = ref<boolean>(false)
  
const errorMessage = ref<string>('')

const handleSubmit = (event: Event) => {
  if (existsChecked.value && permanentChecked.value && notRepeatedChecked.value) {
    window.localStorage.setItem('circulab:add:validation', 'completed')
  } else {
    event.preventDefault()
    errorMessage.value = 'Tem de aceitar todas as condições para continuar'
  }
}
</script>

<template>
  <form
    :action="formAction"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <wa-callout v-if="errorMessage" variant="danger">{{ errorMessage }}</wa-callout>
      <Grid gap="m" direction="column">
        <p>Ao adicionar um novo pin ao mapa, declaro que:</p>
        <wa-checkbox name="exists" :checked="existsChecked" @change="existsChecked = $event.target.checked"><strong>Existe agora</strong>, não é um projeto que acabou</wa-checkbox>
        <wa-checkbox name="permanent" :checked="permanentChecked" @change="permanentChecked = $event.target.checked"><strong>É um local permanente</strong>. Não é uma atividade ou evento pontual</wa-checkbox>
        <wa-checkbox name="not-repeated" :checked="notRepeatedChecked" @change="notRepeatedChecked = $event.target.checked"><strong>Não é um local que já foi adicionado</strong>. Se já existir, edite o pin existente.</wa-checkbox>
      </Grid>
      <Grid justify="end">
        <wa-button variant="primary" type="submit">Continuar</wa-button>
      </Grid>
    </Grid>
  </form>
</template>