-- Enable Row Level Security on pins and locations (if not already enabled)
ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Allow administrators and moderators to delete pins.
DROP POLICY IF EXISTS pins_delete_moderator_admin ON public.pins;
CREATE POLICY pins_delete_moderator_admin
  ON public.pins
  FOR DELETE
  TO authenticated
  USING (public.is_moderator_or_admin());

-- Allow administrators and moderators to delete locations.
DROP POLICY IF EXISTS locations_delete_moderator_admin ON public.locations;
CREATE POLICY locations_delete_moderator_admin
  ON public.locations
  FOR DELETE
  TO authenticated
  USING (public.is_moderator_or_admin());
