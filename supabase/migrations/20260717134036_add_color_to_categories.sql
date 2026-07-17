-- Add color column to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color text;
