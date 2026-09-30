-- Migration: Multilingual JSONB for taxonomy tables
-- Converts name and description columns to JSONB formatted as {"pt": "...", "en": "..."}
-- Preserves existing Portuguese values.

-- 1. Categories
ALTER TABLE public.categories
  ALTER COLUMN name TYPE jsonb USING CASE
    WHEN jsonb_typeof(to_jsonb(name)) = 'object' THEN name::jsonb
    ELSE jsonb_build_object('pt', name)
  END,
  ALTER COLUMN description TYPE jsonb USING CASE
    WHEN description IS NULL THEN NULL
    WHEN jsonb_typeof(to_jsonb(description)) = 'object' THEN description::jsonb
    ELSE jsonb_build_object('pt', description)
  END;

ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_name_has_pt;
ALTER TABLE public.categories ADD CONSTRAINT categories_name_has_pt CHECK (jsonb_typeof(name) = 'object' AND name ? 'pt');

CREATE INDEX IF NOT EXISTS idx_categories_name_pt ON public.categories (((name->>'pt')));

-- 2. Typologies
ALTER TABLE public.typologies
  ALTER COLUMN name TYPE jsonb USING CASE
    WHEN jsonb_typeof(to_jsonb(name)) = 'object' THEN name::jsonb
    ELSE jsonb_build_object('pt', name)
  END,
  ALTER COLUMN description TYPE jsonb USING CASE
    WHEN description IS NULL THEN NULL
    WHEN jsonb_typeof(to_jsonb(description)) = 'object' THEN description::jsonb
    ELSE jsonb_build_object('pt', description)
  END;

ALTER TABLE public.typologies DROP CONSTRAINT IF EXISTS typologies_name_has_pt;
ALTER TABLE public.typologies ADD CONSTRAINT typologies_name_has_pt CHECK (jsonb_typeof(name) = 'object' AND name ? 'pt');

CREATE INDEX IF NOT EXISTS idx_typologies_name_pt ON public.typologies (((name->>'pt')));

-- 3. Characteristics
ALTER TABLE public.characteristics
  ALTER COLUMN name TYPE jsonb USING CASE
    WHEN jsonb_typeof(to_jsonb(name)) = 'object' THEN name::jsonb
    ELSE jsonb_build_object('pt', name)
  END,
  ALTER COLUMN description TYPE jsonb USING CASE
    WHEN description IS NULL THEN NULL
    WHEN jsonb_typeof(to_jsonb(description)) = 'object' THEN description::jsonb
    ELSE jsonb_build_object('pt', description)
  END;

ALTER TABLE public.characteristics DROP CONSTRAINT IF EXISTS characteristics_name_has_pt;
ALTER TABLE public.characteristics ADD CONSTRAINT characteristics_name_has_pt CHECK (jsonb_typeof(name) = 'object' AND name ? 'pt');

CREATE INDEX IF NOT EXISTS idx_characteristics_name_pt ON public.characteristics (((name->>'pt')));

-- 4. Networks
ALTER TABLE public.networks
  ALTER COLUMN name TYPE jsonb USING CASE
    WHEN jsonb_typeof(to_jsonb(name)) = 'object' THEN name::jsonb
    ELSE jsonb_build_object('pt', name)
  END;

ALTER TABLE public.networks DROP CONSTRAINT IF EXISTS networks_name_has_pt;
ALTER TABLE public.networks ADD CONSTRAINT networks_name_has_pt CHECK (jsonb_typeof(name) = 'object' AND name ? 'pt');

CREATE INDEX IF NOT EXISTS idx_networks_name_pt ON public.networks (((name->>'pt')));

-- 5. Pin Status
ALTER TABLE public.pin_status
  ALTER COLUMN description TYPE jsonb USING CASE
    WHEN jsonb_typeof(to_jsonb(description)) = 'object' THEN description::jsonb
    ELSE jsonb_build_object('pt', description)
  END;

ALTER TABLE public.pin_status DROP CONSTRAINT IF EXISTS pin_status_description_has_pt;
ALTER TABLE public.pin_status ADD CONSTRAINT pin_status_description_has_pt CHECK (jsonb_typeof(description) = 'object' AND description ? 'pt');

-- 6. Roles
ALTER TABLE public.roles
  ALTER COLUMN name TYPE jsonb USING CASE
    WHEN name IS NULL THEN NULL
    WHEN jsonb_typeof(to_jsonb(name)) = 'object' THEN name::jsonb
    ELSE jsonb_build_object('pt', name)
  END,
  ALTER COLUMN description TYPE jsonb USING CASE
    WHEN description IS NULL THEN NULL
    WHEN jsonb_typeof(to_jsonb(description)) = 'object' THEN description::jsonb
    ELSE jsonb_build_object('pt', description)
  END;
