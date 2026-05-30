import type { AppUser } from '@/types/domain/user'

export function userHasAccess(user: AppUser, access: 'dashboard' | 'form') {

  if (access === 'dashboard') {
    return ['moderator', 'admin'].includes(user?.role?.code || '')
  } else if (access === 'form') {
    return !!user?.id // is logged in
  }

  return false
}
