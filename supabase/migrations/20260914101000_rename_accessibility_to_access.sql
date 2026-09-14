-- Rename accessibility column to access in locations table
ALTER TABLE public.locations RENAME COLUMN accessibility TO access;

-- Update check constraint
ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS check_accessibility;
ALTER TABLE public.locations DROP CONSTRAINT IF EXISTS check_access;
ALTER TABLE public.locations ADD CONSTRAINT check_access CHECK (access IN ('public', 'private'));

