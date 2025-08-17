-- Create storage bucket for facility images
INSERT INTO storage.buckets (id, name, public) VALUES ('facility-images', 'facility-images', true);

-- Create storage policies for facility images bucket
CREATE POLICY "Authenticated users can upload facility images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'facility-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can view facility images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'facility-images');

CREATE POLICY "Facility creators can update their images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'facility-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Facility creators can delete their images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'facility-images' AND auth.uid() IS NOT NULL);