/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { Database } from './supabase'
import type { Locale } from '@inlang/paraglide-js'
type AppUser = Database['public']['Tables']['users']['Row']

declare global {
  namespace App {
    interface Locals {
      user?: AppUser,
      locale?: Locale
    }
  }
}