-- Add color column to typologies
ALTER TABLE public.typologies ADD COLUMN IF NOT EXISTS color text;

-- Add icon column to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon text;
