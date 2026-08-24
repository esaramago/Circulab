<script setup lang="ts">
import Grid from '@/components/ui/Grid.vue'
import '@webawesome/input/input.js'
import '@webawesome/button/button.js'
import '@webawesome/select/select.js'
import '@webawesome/option/option.js'
import '@webawesome/dialog/dialog.js'
import { onMounted, watch, ref, computed } from 'vue'
import { useStore } from '@nanostores/vue'
import { $locationDraft, $editingResourceId, setStepCompleted, ensureDraftLoaded } from '@/stores/addResource'
import { localizeHref } from '@/paraglide/runtime.js'
import type { LocationDraft } from '@/types/add-resource-draft'
import phoneAreaCodes from '@/data/countryCodes.json'
import { m } from '@/paraglide/messages.js'
import { actions } from 'astro:actions'

const props = withDefaults(
  defineProps<{
    inModal?: boolean
  }>(),
  {
    inModal: false,
  }
)

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'cancel'): void
}>()

const draft = useStore($locationDraft)
const editingResourceId = useStore($editingResourceId)
const isEdit = computed(() => !!editingResourceId.value)
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

const availableNetworks = ref([])
const isDialogOpen = ref(false)
const editingNetworkIndex = ref<number | null>(null)
const selectedNetworkSlug = ref('')
const networkUrlValue = ref('')

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get('id')
  if (id) {
    await ensureDraftLoaded(id)
  }

  const currentLoc = $locationDraft.get()
  const currentAreaCode = Number(currentLoc.phone_area_code)
  if (isNaN(currentAreaCode) || currentAreaCode <= 0) {
    updateDraft({ phone_area_code: null })
  }

  const phoneAreaCodeValue = $locationDraft.get().phone_area_code
  if (phoneSelectRef.value && phoneAreaCodeValue) {
    await window.customElements.whenDefined('wa-select')
    await phoneSelectRef.value.updateComplete
    const codeNum = Number(phoneAreaCodeValue)
    phoneSelectRef.value.displayLabel = (!isNaN(codeNum) && codeNum > 0) ? `+${codeNum}` : ''
  }

  const { data: nets } = await actions.getNetworks()
  if (nets) {
    availableNetworks.value = nets
  }
})

function openAddDialog() {
  editingNetworkIndex.value = null
  selectedNetworkSlug.value = availableNetworks.value[0]?.slug || ''
  networkUrlValue.value = ''
  isDialogOpen.value = true
}

function openEditDialog(index: number) {
  const net = draft.value.networks[index]
  editingNetworkIndex.value = index
  selectedNetworkSlug.value = net.slug
  networkUrlValue.value = net.value
  isDialogOpen.value = true
}

function deleteNetwork(index: number) {
  const updatedNets = [...(draft.value.networks || [])]
  updatedNets.splice(index, 1)
  updateDraft({ networks: updatedNets })
}

function handleSaveNetwork() {
  if (!networkUrlValue.value) {
    return
  }

  const selectedNet = availableNetworks.value.find(n => n.slug === selectedNetworkSlug.value)
  if (!selectedNet) return

  const updatedNets = [...(draft.value.networks || [])]
  const newNet = {
    slug: selectedNet.slug,
    name: selectedNet.name,
    value: networkUrlValue.value,
    icon: (selectedNet as any).icon || null
  }

  if (editingNetworkIndex.value !== null) {
    updatedNets[editingNetworkIndex.value] = newNet
  } else {
    updatedNets.push(newNet)
  }

  updateDraft({ networks: updatedNets })
  isDialogOpen.value = false
}

function handleDialogHide(event: Event) {
  if (event.target !== event.currentTarget) {
    event.stopPropagation()
    return
  }
  isDialogOpen.value = false
}

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
  window.location.href = localizeHref(isEdit.value ? `/recursos/editar/localizacao?id=${editingResourceId.value}` : '/recursos/novo/localizacao')
}

function handleCancel() {
  emit('cancel')
}

function handleSubmit(event: Event) {
  const form = event.target as HTMLFormElement
  const isCompleted = form.checkValidity()
  setStepCompleted('contacts', isCompleted)
  if (!isCompleted) {
    event.preventDefault()
    return
  }
  if (props.inModal) {
    event.preventDefault()
    emit('save')
  }
}
</script>

<template>
  <form
    :action="localizeHref(isEdit ? `/recursos/editar/resumo?id=${editingResourceId}` : '/recursos/novo/resumo')"
    method="post"
    data-astro-reload
    @submit="handleSubmit"
  >
    <Grid gap="xl" direction="column">
      <h3>{{ m['resources.contacts_heading']() }}</h3>
      <wa-input name="email" type="email" label="Email" :value="draft.email" @input="handleInput" pattern="[^\s@]+@[^\s@]+\.[^\s@]+"></wa-input>
      <fieldset>
        <legend appearance="p">{{ m['resources.phone_heading']() }}</legend>
        <Grid>
          <wa-select ref="phoneSelectRef" id="phone_area_code" class="phone-area-code" name="phone_area_code" :label="m['resources.phone_area_code']()" :value="draft.phone_area_code ? String(draft.phone_area_code) : ''" @change="handleChangeDialCode">
            <wa-option v-for="code in sortedPhoneAreaCodes" :key="code.code" :value="String(code.dial_code)">
              {{code.name}} <span class="u-nowrap">(+{{code.dial_code}})</span>
            </wa-option>
          </wa-select>
          <wa-input class="phone" name="phone" :label="m['resources.phone_label']()" :value="draft.phone ? String(draft.phone) : ''" @input="handleInput"></wa-input>
        </Grid>
      </fieldset>
      <h3>{{ m['resources.channels_heading']() }}</h3>
      <table v-if="draft.networks && draft.networks.length > 0" class="c-table">
        <thead>
          <tr>
            <th>{{ m['resources.channel']() }}</th>
            <th>URL</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(net, index) in draft.networks" :key="index">
            <td>
              <wa-icon v-if="net.icon" :name="net.icon" :family="net.icon === 'globe' ? null : 'brands'"></wa-icon>
              {{ net.name }}
            </td>
            <td>
              <a :href="net.value" target="_blank" rel="noopener noreferrer">{{ net.value }}</a>
            </td>
            <td>
              <Grid gap="xs" justify="end">
                <wa-button size="xs" variant="neutral" @click="openEditDialog(index)">
                  <wa-icon name="pen"></wa-icon>
                </wa-button>
                <wa-button size="xs" variant="neutral" @click="deleteNetwork(index)">
                  <wa-icon name="trash"></wa-icon>
                </wa-button>
              </Grid>
            </td>
          </tr>
        </tbody>
      </table>

      <wa-button variant="brand" appearance="outlined" @click="openAddDialog">
        <wa-icon name="plus" slot="start"></wa-icon>
        {{ m['resources.add_channel']() }}
      </wa-button>

      <Grid v-if="inModal" justify="end" gap="xs">
        <wa-button variant="neutral" appearance="outlined" type="button" @click="handleCancel">{{ m['resources.cancel']() }}</wa-button>
        <wa-button variant="brand" type="submit">{{ m['resources.save']() }}</wa-button>
      </Grid>
      <Grid v-else justify="end" gap="xs">
        <wa-button variant="primary" appearance="outlined" type="button" @click="handleBack">{{ m['resources.back']() }}</wa-button>
        <wa-button variant="primary" type="submit">{{ m['resources.continue']() }}</wa-button>
      </Grid>
    </Grid>
  </form>

  <wa-dialog
    :label="editingNetworkIndex !== null ? m['resources.edit_channel']() : m['resources.add_channel']()"
    :open="isDialogOpen || null"
    @wa-hide="handleDialogHide"
  >
    <Grid gap="m" direction="column">
      <wa-select
        :label="m['resources.channel_type']()"
        :value="selectedNetworkSlug"
        @change="selectedNetworkSlug = ($event.target as any).value"
      >
        <wa-option v-for="net in availableNetworks" :key="net.slug" :value="net.slug">
          {{ net.name }}
        </wa-option>
      </wa-select>

      <wa-input
        type="url"
        label="URL"
        placeholder="https://..."
        :value="networkUrlValue"
        @input="networkUrlValue = ($event.target as HTMLInputElement).value"
        required
      ></wa-input>
    </Grid>

    <div slot="footer" class="dialog-footer">
      <wa-button variant="neutral" @click="isDialogOpen = false">{{ m['resources.cancel']() }}</wa-button>
      <wa-button variant="brand" @click="handleSaveNetwork">{{ m['resources.save']() }}</wa-button>
    </div>
  </wa-dialog>
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
.networks-list {
  display: flex;
  flex-direction: column;
  gap: var(--wa-space-xs);
  border: 1px solid var(--wa-color-surface-border);
  border-radius: var(--wa-border-radius-m);
  padding: var(--wa-space-s);
}
.network-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--wa-space-xs) 0;
  border-bottom: 1px solid var(--wa-color-surface-border);
}
.network-item:last-child {
  border-bottom: none;
}
.network-item__info {
  display: flex;
  gap: var(--wa-space-xs);
  overflow: hidden;
}
.network-item__name {
  font-weight: var(--wa-font-weight-semibold);
  color: var(--wa-color-text-secondary);
}
.network-item__value {
  color: var(--wa-color-brand-default);
  text-decoration: none;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.network-item__value:hover {
  text-decoration: underline;
}
.network-item__actions {
  display: flex;
  gap: var(--wa-space-xxs);
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--wa-space-xs);
}
</style>