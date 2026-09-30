-- Replace unrestricted WITH CHECK (true) on location_networks_insert_authenticated
-- with check for registered users (public.is_registered_user())
-- This resolves the Supabase Security Advisor warning while aligning with locations_insert_contributor policy.

DROP POLICY IF EXISTS location_networks_insert_authenticated ON public.location_networks;

CREATE POLICY location_networks_insert_authenticated
  ON public.location_networks
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_registered_user());
