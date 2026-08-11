-- Add icon column to typologies
ALTER TABLE public.typologies ADD COLUMN IF NOT EXISTS icon text;
