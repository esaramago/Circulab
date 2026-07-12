# Database

Postgres + **PostGIS** (`geography(Point, 4326)` for coordinates). Application users: **`auth.users`** (Supabase Auth).

## Tables

* **pin_status** (lookup table for pin approval workflow)
  * `id` (integer, PK)
  * `code` (unique: `approved`, `rejected`, `pending`)
  * `description` (optional)
  * `created_at`

* **roles** (user role definitions)
  * `id` (integer, PK)
  * `code` (unique: e.g., `contributor`, `moderator`, `admin`)
  * `name` (optional)
  * `description` (optional)

* **users** (application user profiles, synced from `auth.users`)
  * `id` (UUID, PK) → `auth.users.id`
  * `email`
  * `role_id` → `roles.id`
  * `is_active` (boolean, optional)
  * `is_blocked` (boolean, optional)
  * `accepted_pins_count` (integer, optional)

* **typologies**
  * `id` (UUID, PK)
  * `name`
  * `code` (unique)
  * `slug` (unique)
  * `description` (optional)
  * `created_at`

* **categories**
  * `id` (UUID, PK)
  * `name`
  * `slug` (unique per typology)
  * `description` (optional)
  * `typology_id` → `typologies.id`
  * `created_at`

* **characteristics**
  * `id` (UUID, PK)
  * `name`
  * `slug` (unique per category)
  * `category_id` → `categories.id`
  * `description` (optional)
  * `created_at`

* **networks** (network kinds: website, instagram, facebook, etc.)
  * `id` (UUID, PK)
  * `name`
  * `slug` (unique)
  * `created_at`

* **locations**
  * `id` (UUID, PK)
  * `name`
  * `address` (optional)
  * `postal_code` (optional)
  * `location` (free text, optional)
  * `coordinates` (PostGIS / `geography(Point, 4326)`)
  * `phone` (optional)
  * `phone_area_code` (integer, optional)
  * `email` (optional)
  * `created_at`
  * `updated_at`
  * `get_geojson` (computed column: GeoJSON representation of coordinates)

* **location_networks** (N:N between `locations` and `networks`)
  * `location_id` → `locations.id`
  * `network_id` → `networks.id`
  * `value` (URL or handle on that network)

* **pins**
  * `id` (UUID, PK)
  * `title`
  * `description` (optional)
  * `images` — JSON array; each element `{ "bucket": "<bucket name>", "path": "<path within bucket>" }`, aligned with Supabase Storage (`storage.from(bucket).…`). Project bucket: **`pin-images`**.
  * `location` (text, free-form location description)
  * `coordinates` (PostGIS / `geography(Point, 4326)`; more specific than the text field)
  * `category_id` → `categories.id`
  * `location_id` → `locations.id`
  * `characteristics_ids` — `uuid[]` of `characteristics` ids (no per-element FK in Postgres; validate in the app)
  * `status` → `pin_status.code` (approved, rejected, pending)
  * `created_by` → `auth.users.id` (via `users.id`)
  * `accepted_by` → `auth.users.id` (via `users.id`, optional)
  * `updated_by` → `auth.users.id` (via `users.id`, optional)
  * `created_date`
  * `updated_date` (optional)
  * `get_geojson` (computed column: GeoJSON representation of coordinates)

## Views

* **geography_columns** (PostGIS system view)
* **geometry_columns** (PostGIS system view)

## Row Level Security (RLS)

Policies defined on:
* `locations` — INSERT allowed for moderators/admins and registered contributors
* `pins` — INSERT allowed for moderators/admins and registered contributors, with `created_by` = current user
* `roles` — SELECT allowed for all authenticated users (lookup table)

## Triggers

* `handle_new_user()` — On new `auth.users` creation, automatically creates a `public.users` row with the default `contributor` role.

## Notes

* **Application users**: Stored in `auth.users` (Supabase Auth). Application-specific profile data and roles are in `public.users` and `public.roles`.
* **GiST indexes**: Applied on `coordinates` for `locations` and `pins` for efficient spatial queries.
* **GIN indexes**: Applied on `pins.characteristics_ids` for efficient array containment queries.
* **Computed columns**: `get_geojson` on both `locations` and `pins` returns GeoJSON representation of the PostGIS point.
