---
title: Database
layout: '@/layouts/DocsLayout.astro'
order: 4
---

# Database

Postgres + **PostGIS** (`geography(Point, 4326)` for coordinates). Application users: **`auth.users`** (Supabase Auth); there is no `public.users` or `public.roles` table in this schema.

## Tables

* **typologies**
  * `name`, `slug` (unique)
  * `created_at`

* **categories**
  * `name`, `slug` (unique per typology)
  * `typology_id` → `typologies`

* **characteristics**
  * `name`, `slug` (unique per category)
  * `category_id` → `categories`
  * `description` (optional)
  * `created_at`

* **networks** (network kinds: website, instagram, facebook, …)
  * `name`, `slug` (unique)

* **locations**
  * `name`
  * `address`, `postal_code`, `location` (free text)
  * `coordinates` (PostGIS / geography Point)
  * `email`, `phone` (optional)
  * `created_at`, `updated_at`

* **location_networks** (network links per location: N:N between `locations` and `networks`)
  * `location_id` → `locations`
  * `network_id` → `networks`
  * `value` (URL or handle on that network)

* **pins**
  * `title`, `description`
  * `images` — JSON array; each element `{ "bucket": "<bucket name>", "path": "<path within bucket>" }`, aligned with Supabase Storage (`storage.from(bucket).…`). Project bucket: **`pin-images`**.
  * `location` (text), `coordinates` (PostGIS; more specific than the text field)
  * `category_id` → `categories`
  * `characteristics_ids` — `uuid[]` of `characteristics` ids (no per-element FK in Postgres; validate in the app)
  * `created_by`, `accepted_by`, `updated_by` → **`auth.users`**
  * `created_date`, `updated_date`

## Notes

* **Users / roles** at the product level may map to profiles on `auth.users` / claims or future tables; they are not modeled under `public` in this document.
* GiST indexes on coordinates for `locations` and `pins`; GIN on `pins.characteristics_ids`.
