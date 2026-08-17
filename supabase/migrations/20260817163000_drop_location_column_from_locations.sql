-- Drop unused location column from locations table
ALTER TABLE public.locations DROP COLUMN IF EXISTS location;
