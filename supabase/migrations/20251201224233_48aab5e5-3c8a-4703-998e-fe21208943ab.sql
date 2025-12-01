-- Allow anonymous users to read host profiles by access_key for event registration
-- This is needed for the registration flow when scanning QR codes
CREATE POLICY "Public can read host profiles for event registration"
ON public.profiles
FOR SELECT
USING (
  role = 'host'
);