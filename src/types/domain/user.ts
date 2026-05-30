import type { RoleRow, UserRow } from '@/types/database'

export type AppUser = UserRow & { role: RoleRow }
