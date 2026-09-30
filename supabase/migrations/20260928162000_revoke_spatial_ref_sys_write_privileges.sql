-- Revoke write privileges on spatial_ref_sys from API roles (anon and authenticated)
-- spatial_ref_sys is PostGIS reference data. Preventing writes protects the reference table
-- while allowing SELECT ensures PostGIS spatial functions (e.g. ST_Transform, ST_SetSRID) continue working.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public.spatial_ref_sys FROM anon, authenticated;
