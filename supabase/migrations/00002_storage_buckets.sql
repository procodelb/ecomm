-- ============================================================================
-- STORAGE BUCKETS + RLS POLICIES
-- ============================================================================

-- 1. CREATE BUCKETS

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', TRUE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('product-videos', 'product-videos', TRUE, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('product-3d-models', 'product-3d-models', TRUE, 52428800, ARRAY['model/gltf+json', 'model/gltf-binary', 'application/octet-stream']),
  ('avatars', 'avatars', TRUE, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('review-images', 'review-images', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
ON CONFLICT (id) DO NOTHING;

-- 2. STORAGE RLS

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public read access for all buckets
CREATE POLICY "Public Read" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('product-images', 'product-videos', 'product-3d-models', 'avatars', 'review-images')
  );

-- Authenticated users can upload (own folder)
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('product-images', 'product-videos', 'product-3d-models', 'avatars', 'review-images')
    AND owner = auth.uid()
  );

-- Users can update own files
CREATE POLICY "Owner Update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (owner = auth.uid())
  WITH CHECK (owner = auth.uid());

-- Users can delete own files
CREATE POLICY "Owner Delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (owner = auth.uid());

-- Admins have full access
CREATE POLICY "Admin Full Access" ON storage.objects
  FOR ALL TO authenticated
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Service role has full access
CREATE POLICY "Service Role Full Access" ON storage.objects
  FOR ALL TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

-- 3. AVATAR FOLDER RESTRICTION

CREATE OR REPLACE FUNCTION storage.enforce_avatar_folder()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bucket_id = 'avatars' THEN
    IF NEW.name !~ '^[^/]+/.+$' THEN
      RAISE EXCEPTION 'Avatar files must be in a user-specific folder (e.g. <user_id>/file.jpg)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_avatar_folder
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION storage.enforce_avatar_folder();
