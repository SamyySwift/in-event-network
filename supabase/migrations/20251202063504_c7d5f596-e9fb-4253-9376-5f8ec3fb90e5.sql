-- Drop the overly permissive public read policy for host profiles
DROP POLICY IF EXISTS "Public can read host profiles for event registration" ON public.profiles;

-- Drop and recreate the public_profiles view with limited fields
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  photo_url,
  role,
  company,
  bio,
  niche
FROM public.profiles
WHERE role = 'host';

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add policy for authenticated users to view host profiles when needed for events they're part of
CREATE POLICY "Authenticated users can view host profiles for their events"
ON public.profiles
FOR SELECT
USING (
  role = 'host' AND EXISTS (
    SELECT 1 FROM events e
    JOIN event_participants ep ON e.id = ep.event_id
    WHERE e.host_id = profiles.id AND ep.user_id = auth.uid()
  )
);