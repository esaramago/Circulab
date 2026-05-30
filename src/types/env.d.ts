/// <reference path="../../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { AppUser } from '@/types/domain/user'
import type { Locale } from '@inlang/paraglide-js'

declare global {
  namespace App {
    interface Locals {
      user?: AppUser
      locale?: Locale
    }
  }
}
