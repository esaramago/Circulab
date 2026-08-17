-- Add icon column to networks table
ALTER TABLE public.networks ADD COLUMN IF NOT EXISTS icon text;

-- Seed default networks with icons
INSERT INTO public.networks (name, slug, icon)
VALUES
  ('Website', 'website', 'globe'),
  ('Instagram', 'instagram', 'instagram'),
  ('Facebook', 'facebook', 'facebook')
ON CONFLICT (slug)
DO UPDATE SET icon = EXCLUDED.icon;
