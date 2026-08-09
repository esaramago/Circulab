-- Add accessibility column to locations
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS accessibility text;

-- Add check constraint to restrict values to 'public' or 'private'
ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS check_accessibility;
ALTER TABLE public.locations ADD CONSTRAINT check_accessibility CHECK (accessibility IN ('public', 'private'));
