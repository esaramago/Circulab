<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import { onMounted, watch, ref, computed } from 'vue'
import { useStore } from '@nanostores/vue'
import { $locationDraft, setStepCompleted } from '@/stores/addResource'
import type { LocationDraft } from '@/types/add-resource-draft'
import phoneAreaCodes from '@/data/countryCodes.json'

const draft = useStore($locationDraft)
const phoneSelectRef = ref<any>(null)

const sortedPhoneAreaCodes = computed(() => {
  const sorted = [...phoneAreaCodes].sort((a, b) => a.name.localeCompare(b.name))
  const portugalIndex = sorted.findIndex(code => code.code === 'PT')
  if (portugalIndex > -1) {
    const [portugal] = sorted.splice(portugalIndex, 1)
    return [portugal, ...sorted]
  }
  return sorted
})

watch(() => draft.value.phone_area_code, async newVal => {
  if (typeof window !== 'undefined' && phoneSelectRef.value) {
    await window.customElements.whenDefined('wa-select')
    await phoneSelectRef.value.updateComplete
    const codeNum = Number(newVal)
    phoneSelectRef.value.displayLabel = (!isNaN(codeNum) && codeNum > 0) ? `+${codeNum}` : ''
  }
}, { flush: 'post' })

onMounted(async () => {
  const currentAreaCode = Number(draft.value.phone_area_code)
  if (isNaN(currentAreaCode) || currentAreaCode <= 0) {
    updateDraft({ phone_area_code: null })
  }

  if (phoneSelectRef.value && draft.value.phone_area_code) {
    await window.customElements.whenDefined('wa-select')
    await phoneSelectRef.value.updateComplete
    const codeNum = Number(draft.value.phone_area_code)
    phoneSelectRef.value.displayLabel = (!isNaN(codeNum) && codeNum > 0) ? `+${codeNum}` : ''
  }
})

function updateDraft(partial: Partial<LocationDraft>) {
  $locationDraft.set({
    ...draft.value,
    ...partial,
  } as LocationDraft)
}

function handleInput(event: Event) {
  const field = event.target as HTMLInputElement & { checkValidity?: () => boolean }
  const name = field.name
  const key = name as keyof LocationDraft

  if (name === 'phone') {
    const phoneValue = field.value === '' ? null : Number(field.value)
    updateDraft({ [key]: phoneValue })
    return
  }

  if (!field.value) {
    updateDraft({ [key]: '' })
    return
  }

  if (field.checkValidity && !field.checkValidity()) return

  updateDraft({ [key]: field.value } as Partial<LocationDraft>)
}

function handleChangeDialCode(event: Event) {
  const target = event.target as any
  const value = target.value ? Number(target.value) : null
  updateDraft({ phone_area_code: value })
}

function handleBack() {
  window.location.href = '/recursos/novo/localizacao'
}

function handleSubmit(event: Event) {
  const isCompleted = (event.target as HTMLFormElement).checkValidity()
  setStepCompleted('contacts', isCompleted)
  if (!isCompleted) {
    event.preventDefault()
  }
}
</script>

<template>
  <form
    action="/recursos/novo/resumo"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <h3>Contactos</h3>
      <wa-input name="email" type="email" label="Email" :value="draft.email" @input="handleInput"></wa-input>
      <fieldset>
        <legend appearance="p">Telefone</legend>
        <Grid>
          <wa-select ref="phoneSelectRef" id="phone_area_code" class="phone-area-code" name="phone_area_code" label="Indicativo" :value="draft.phone_area_code ? String(draft.phone_area_code) : ''" @change="handleChangeDialCode">
            <wa-option v-for="code in sortedPhoneAreaCodes" :key="code.code" :value="String(code.dial_code)">
              {{code.name}} <span class="u-nowrap">(+{{code.dial_code}})</span>
            </wa-option>
          </wa-select>
          <wa-input class="phone" name="phone" label="Telefone" :value="draft.phone ? String(draft.phone) : ''" @input="handleInput"></wa-input>
        </Grid>
      </fieldset>
      <h3>Canais</h3>
      <wa-input name="website" type="url" label="Website" :value="draft.website" @input="handleInput"></wa-input>
      <wa-input name="instagram" type="url" label="Instagram" :value="draft.instagram" @input="handleInput"></wa-input>
      <wa-input name="facebook" type="url" label="Facebook" :value="draft.facebook" @input="handleInput"></wa-input>
      <Grid justify="end" gap="xs">
        <wa-button variant="primary" appearance="outlined" @click="handleBack">Voltar</wa-button>
        <wa-button variant="primary" type="submit">Continuar</wa-button>
      </Grid>
    </Grid>
  </form>
</template>

<style scoped>
.phone-area-code {
  width: 120px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.phone-area-code::part(listbox) {
  min-width: 250px;
}
.phone {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>