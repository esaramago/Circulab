-- Add has_category_color column to typologies
ALTER TABLE public.typologies ADD COLUMN IF NOT EXISTS has_category_color boolean NOT NULL DEFAULT true;
