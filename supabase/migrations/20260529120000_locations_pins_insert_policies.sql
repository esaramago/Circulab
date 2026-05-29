-- Allow dashboard roles (moderator, admin) to create locations and pins.

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role_id IN (2, 3)
  );
$$;

CREATE POLICY locations_insert_moderator_admin
  ON public.locations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_moderator_or_admin());

CREATE POLICY pins_insert_moderator_admin
  ON public.pins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_moderator_or_admin()
    AND created_by = auth.uid()
  );
