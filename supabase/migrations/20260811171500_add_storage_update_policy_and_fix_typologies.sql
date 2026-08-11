-- Fix public.is_admin() to check role code = 'admin' dynamically
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
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid()
      AND r.code = 'admin'
  );
$$;

-- Allow authenticated users to update (UPDATE) files in the "pin-images" bucket
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
CREATE POLICY "Allow authenticated users to update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pin-images')
WITH CHECK (bucket_id = 'pin-images');
