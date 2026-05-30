-- Allow registered contributors to create locations and pins via the public form.

CREATE OR REPLACE FUNCTION public.is_registered_user()
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
  );
$$;

CREATE POLICY locations_insert_contributor
  ON public.locations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_registered_user());

CREATE POLICY pins_insert_contributor
  ON public.pins
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_registered_user()
    AND created_by = auth.uid()
  );
