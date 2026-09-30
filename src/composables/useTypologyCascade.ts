import { onMounted, ref } from 'vue'
import type { TypologyRow, CategoryRow, CharacteristicRow } from '@/types/database'
import { fetchDB } from '@/utils/fetchDB'
import { i18nDb } from '@/utils/i18nDb'

type Typology = TypologyRow
type Category = CategoryRow
type Characteristic = CharacteristicRow

export function useTypologyCascade(initialTypologies?: Typology[] | null) {
  const typologies = ref<Typology[]>(initialTypologies ?? [])
  const categories = ref<Category[]>([])
  const characteristics = ref<Characteristic[]>([])

  onMounted(() => {
    if (!typologies.value.length) {
      loadTypologies()
    }
  })

  async function loadTypologies() {
    const { data } = await fetchDB('typologies').select('*')
    const list = ((data ?? []) as unknown as Typology[])
    list.sort((a, b) => i18nDb(a.name).localeCompare(i18nDb(b.name)))
    typologies.value = list
  }

  async function loadCategories(typologyId: string) {
    const { data } = await fetchDB('categories').select('*').eq('typology_id', typologyId)
    const list = ((data ?? []) as unknown as Category[])
    list.sort((a, b) => i18nDb(a.name).localeCompare(i18nDb(b.name)))
    categories.value = list
    characteristics.value = []
  }

  async function loadCharacteristics(categoryId: string) {
    const { data } = await fetchDB('characteristics').select('*').eq('category_id', categoryId)
    const list = ((data ?? []) as unknown as Characteristic[])
    list.sort((a, b) => i18nDb(a.name).localeCompare(i18nDb(b.name)))
    characteristics.value = list
  }

  return {
    typologies,
    categories,
    characteristics,
    loadTypologies,
    loadCategories,
    loadCharacteristics
  }
}
