-- Create suggested_pins table for user suggestions (both additions and edits)
CREATE TABLE IF NOT EXISTS public.suggested_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id UUID REFERENCES public.pins(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'standby',
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  characteristics_ids TEXT[] DEFAULT '{}'::TEXT[],
  images JSONB DEFAULT '[]'::JSONB,
  coordinates GEOGRAPHY(Point, 4326),
  location_name TEXT,
  address TEXT,
  postal_code TEXT,
  email TEXT,
  phone TEXT,
  phone_area_code INTEGER,
  access TEXT,
  accessibility BOOLEAN,
  has_opening_hours BOOLEAN DEFAULT false,
  opening_hours JSONB,
  networks JSONB DEFAULT '[]'::JSONB,
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Computed column for PostgREST geojson representation
CREATE OR REPLACE FUNCTION public.get_geojson(p public.suggested_pins)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT ST_AsGeoJSON(p.coordinates)::jsonb;
$$;

-- Enable Row Level Security
ALTER TABLE public.suggested_pins ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert suggestions as their own author
DROP POLICY IF EXISTS suggested_pins_insert_authenticated ON public.suggested_pins;
CREATE POLICY suggested_pins_insert_authenticated
  ON public.suggested_pins
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Allow creators to select their own suggestions and moderators/admins to select all
DROP POLICY IF EXISTS suggested_pins_select_creator_or_moderator ON public.suggested_pins;
CREATE POLICY suggested_pins_select_creator_or_moderator
  ON public.suggested_pins
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR public.is_moderator_or_admin());

-- Allow moderators and admins to update suggestions
DROP POLICY IF EXISTS suggested_pins_update_moderator ON public.suggested_pins;
CREATE POLICY suggested_pins_update_moderator
  ON public.suggested_pins
  FOR UPDATE
  TO authenticated
  USING (public.is_moderator_or_admin())
  WITH CHECK (public.is_moderator_or_admin());

-- Allow moderators and admins to delete suggestions
DROP POLICY IF EXISTS suggested_pins_delete_moderator ON public.suggested_pins;
CREATE POLICY suggested_pins_delete_moderator
  ON public.suggested_pins
  FOR DELETE
  TO authenticated
  USING (public.is_moderator_or_admin());

-- Grant privileges to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suggested_pins TO authenticated;

