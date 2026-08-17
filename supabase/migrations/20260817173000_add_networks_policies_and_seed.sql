-- Enable Row Level Security on networks and location_networks if not already enabled.
ALTER TABLE public.networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_networks ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read networks and location_networks.
DROP POLICY IF EXISTS networks_select_all ON public.networks;
CREATE POLICY networks_select_all
  ON public.networks
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS location_networks_select_all ON public.location_networks;
CREATE POLICY location_networks_select_all
  ON public.location_networks
  FOR SELECT
  USING (true);

-- Allow administrators to insert/update/delete networks.
DROP POLICY IF EXISTS networks_insert_admin ON public.networks;
CREATE POLICY networks_insert_admin
  ON public.networks
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS networks_update_admin ON public.networks;
CREATE POLICY networks_update_admin
  ON public.networks
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS networks_delete_admin ON public.networks;
CREATE POLICY networks_delete_admin
  ON public.networks
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Allow authenticated users to insert location_networks.
DROP POLICY IF EXISTS location_networks_insert_authenticated ON public.location_networks;
CREATE POLICY location_networks_insert_authenticated
  ON public.location_networks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow administrators and moderators to update location_networks.
DROP POLICY IF EXISTS location_networks_update_moderator_admin ON public.location_networks;
CREATE POLICY location_networks_update_moderator_admin
  ON public.location_networks
  FOR UPDATE
  TO authenticated
  USING (public.is_moderator_or_admin())
  WITH CHECK (public.is_moderator_or_admin());

-- Allow administrators and moderators to delete location_networks.
DROP POLICY IF EXISTS location_networks_delete_moderator_admin ON public.location_networks;
CREATE POLICY location_networks_delete_moderator_admin
  ON public.location_networks
  FOR DELETE
  TO authenticated
  USING (public.is_moderator_or_admin());

-- Seed default networks
INSERT INTO public.networks (name, slug)
VALUES
  ('Website', 'website'),
  ('Instagram', 'instagram'),
  ('Facebook', 'facebook')
ON CONFLICT (slug) DO NOTHING;
