-- Migration: Ensure networks.name is JSONB and add English translations
-- 1. Ensure column name is jsonb (if still text, as in staging)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'networks' 
      AND column_name = 'name' 
      AND data_type = 'text'
  ) THEN
    ALTER TABLE public.networks
      ALTER COLUMN name TYPE jsonb USING CASE
        WHEN jsonb_typeof(to_jsonb(name)) = 'object' THEN name::jsonb
        ELSE jsonb_build_object('pt', name)
      END;
  END IF;
END $$;

-- 2. Ensure constraints and indexes exist
ALTER TABLE public.networks DROP CONSTRAINT IF EXISTS networks_name_has_pt;
ALTER TABLE public.networks ADD CONSTRAINT networks_name_has_pt CHECK (jsonb_typeof(name) = 'object' AND name ? 'pt');

CREATE INDEX IF NOT EXISTS idx_networks_name_pt ON public.networks (((name->>'pt')));

-- 3. Populate / update bilingual names (pt & en)
UPDATE public.networks
SET name = jsonb_build_object('pt', 'Website', 'en', 'Website')
WHERE slug = 'website';

UPDATE public.networks
SET name = jsonb_build_object('pt', 'Instagram', 'en', 'Instagram')
WHERE slug = 'instagram';

UPDATE public.networks
SET name = jsonb_build_object('pt', 'Facebook', 'en', 'Facebook')
WHERE slug = 'facebook';

UPDATE public.networks
SET name = jsonb_build_object('pt', COALESCE(name->>'pt', 'Outro'), 'en', 'Other')
WHERE slug IN ('outro', 'other');

-- 4. For any other network entry that may exist without 'en', copy 'pt' as default
UPDATE public.networks
SET name = name || jsonb_build_object('en', name->>'pt')
WHERE NOT (name ? 'en') AND (name ? 'pt');
