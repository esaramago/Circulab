-- Allow administrators and moderators to update pins.
DROP POLICY IF EXISTS pins_update_moderator_admin ON public.pins;
CREATE POLICY pins_update_moderator_admin
  ON public.pins
  FOR UPDATE
  TO authenticated
  USING (public.is_moderator_or_admin())
  WITH CHECK (public.is_moderator_or_admin());

-- Allow administrators and moderators to update locations.
DROP POLICY IF EXISTS locations_update_moderator_admin ON public.locations;
CREATE POLICY locations_update_moderator_admin
  ON public.locations
  FOR UPDATE
  TO authenticated
  USING (public.is_moderator_or_admin())
  WITH CHECK (public.is_moderator_or_admin());
