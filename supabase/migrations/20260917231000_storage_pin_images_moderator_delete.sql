-- Fix public.is_moderator_or_admin() to check role codes ('moderator', 'admin') dynamically and run as SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
      AND r.code IN ('moderator', 'admin')
  );
$$;

-- Allow moderators and admins to delete images in the "pin-images" bucket (e.g. when rejecting suggested resources)
DROP POLICY IF EXISTS "Allow moderators and admins to delete images" ON storage.objects;
CREATE POLICY "Allow moderators and admins to delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'pin-images' AND public.is_moderator_or_admin()
  );
