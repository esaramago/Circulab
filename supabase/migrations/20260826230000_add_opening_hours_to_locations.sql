-- Add has_opening_hours and opening_hours columns to locations
ALTER TABLE public.locations
ADD COLUMN IF NOT EXISTS has_opening_hours boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS opening_hours jsonb DEFAULT NULL;
