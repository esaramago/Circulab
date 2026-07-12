-- Create the pin-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pin-images', 'pin-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload (INSERT) files to the "pin-images" bucket
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pin-images'
);

-- Allow public access (SELECT) to view images in the "pin-images" bucket
CREATE POLICY "Allow public access to images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'pin-images'
);

-- Allow users to delete (DELETE) their own files
CREATE POLICY "Allow users to delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'pin-images' AND auth.uid()::text = owner_id::text
);
