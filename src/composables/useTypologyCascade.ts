import { onMounted, ref } from 'vue'
import type { Database } from '@/types/supabase'
import { fetchDB } from '@/utils/fetchDB'

type Typology = Database['public']['Tables']['typologies']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Characteristic = Database['public']['Tables']['characteristics']['Row']

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
    const { data } = await fetchDB('typologies')
      .select('*')
      .order('name', { ascending: true })
    typologies.value = data ?? []
  }

  async function loadCategories(typologyId: string) {
    const { data } = await fetchDB('categories').select('*').eq('typology_id', typologyId).order('name', { ascending: true })
    categories.value = data ?? []
    characteristics.value = []
  }

  async function loadCharacteristics(categoryId: string) {
    const { data } = await fetchDB('characteristics').select('*').eq('category_id', categoryId).order('name', { ascending: true })
    characteristics.value = data ?? []
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
