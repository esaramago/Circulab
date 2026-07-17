-- Enable Row Level Security on typologies.
ALTER TABLE public.typologies ENABLE ROW LEVEL SECURITY;

-- Allow anyone (authenticated and anonymous) to read typologies.
DROP POLICY IF EXISTS typologies_select_all ON public.typologies;
CREATE POLICY typologies_select_all
  ON public.typologies
  FOR SELECT
  USING (true);

-- Allow administrators to update existing typologies.
DROP POLICY IF EXISTS typologies_update_admin ON public.typologies;
CREATE POLICY typologies_update_admin
  ON public.typologies
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
