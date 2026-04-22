/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { Database } from './supabase'

type AppUser = Database['public']['Tables']['users']['Row']

declare global {
  namespace App {
    interface Locals {
      user?: AppUser
    }
  }
}