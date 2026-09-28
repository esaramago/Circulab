-- Fix role mutable search_path for get_geojson computed column functions
-- By explicitly setting search_path to public, extensions, we prevent search_path hijacking
-- and ensure PostGIS functions like ST_AsGeoJSON are resolved correctly.

CREATE OR REPLACE FUNCTION public.get_geojson(p public.pins)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT ST_AsGeoJSON(p.coordinates)::jsonb;
$$;

CREATE OR REPLACE FUNCTION public.get_geojson(p public.locations)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT ST_AsGeoJSON(p.coordinates)::jsonb;
$$;

CREATE OR REPLACE FUNCTION public.get_geojson(p public.suggested_pins)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT ST_AsGeoJSON(p.coordinates)::jsonb;
$$;
