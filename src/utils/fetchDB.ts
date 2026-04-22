import type { Database } from '@/types/supabase'
import { supabase } from '@/utils/supabase'

export type PublicTableName = keyof Database['public']['Tables']

export function fetchDB<TableName extends PublicTableName>(table: TableName) {
  if (!table) {
    throw new Error('fetchDB: table name is required')
  }
  return supabase.from(table)
}
