
-- Add photo_url column to speakers table if it doesn't exist (it already exists)
-- Add image_url column to schedule_items table
ALTER TABLE schedule_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to facilities table if it doesn't exist (it already exists)
-- Update facilities table to ensure image_url column exists
-- (The facilities table already has image_url column based on the schema)

-- Create a storage bucket for event images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'event-images',
  'event-images', 
  true,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  5242880 -- 5MB limit
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the event-images bucket
CREATE POLICY "Authenticated users can upload event images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Public can view event images" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Users can update their own event images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'event-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own event images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'event-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
