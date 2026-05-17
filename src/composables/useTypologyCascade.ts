import { onMounted, ref } from 'vue'
import type { Database } from '@/types/supabase'
import { fetchDB } from '@/utils/fetchDB'

type Typology = Database['public']['Tables']['typologies']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Characteristic = Database['public']['Tables']['characteristics']['Row']

export function useTypologyCascade() {
  const typologies = ref<Typology[]>([])
  const categories = ref<Category[]>([])
  const characteristics = ref<Characteristic[]>([])

  onMounted(() => {
    _loadTypologies()
  })

  async function _loadTypologies() {
    const { data } = await fetchDB('typologies').select('*')
    typologies.value = data ?? []
  }

  async function loadCategories(typologyId: string) {
    const { data } = await fetchDB('categories').select('*').eq('typology_id', typologyId)
    categories.value = data ?? []
    characteristics.value = []
  }

  async function loadCharacteristics(categoryId: string) {
    const { data } = await fetchDB('characteristics').select('*').eq('category_id', categoryId)
    characteristics.value = data ?? []
  }

  return {
    typologies,
    categories,
    characteristics,
    loadCategories,
    loadCharacteristics
  }
}
