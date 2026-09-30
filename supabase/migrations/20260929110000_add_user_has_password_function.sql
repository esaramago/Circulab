-- Function to check if the authenticated user has a password set in auth.users
CREATE OR REPLACE FUNCTION public.user_has_password()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND encrypted_password IS NOT NULL
      AND encrypted_password != ''
  );
$$;

REVOKE EXECUTE ON FUNCTION public.user_has_password() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_has_password() TO authenticated;
