-- Add physical accessibility column to locations table
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS accessibility boolean DEFAULT null;

