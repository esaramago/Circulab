-- Helper function to check if the current authenticated user is an administrator (role_id = 3).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role_id = 3
  );
$$;

-- Allow administrators to insert new categories.
CREATE POLICY categories_insert_admin
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Allow administrators to update existing categories.
CREATE POLICY categories_update_admin
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow administrators to delete categories.
CREATE POLICY categories_delete_admin
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
