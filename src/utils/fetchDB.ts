import type { Database } from '@/types/supabase'
import { supabase } from '@/utils/supabase'

/** Nomes de tabelas em `public` (alinhado ao schema gerado). */
export type PublicTableName = keyof Database['public']['Tables']

/**
 * Ponto de entrada para queries em tabelas — delega em `supabase.from()`.
 * Ex.: `fetchDB('categories').select('*').eq('id', id)` (`.eq` recebe coluna e valor, não um único número).
 */
export function fetchDB<TableName extends PublicTableName>(table: TableName) {
  if (!table) {
    throw new Error('fetchDB: table name is required')
  }
  return supabase.from(table)
}
