-- Enable RLS on public_profiles table if it doesn't have it
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for public_profiles to allow viewing networking profiles
CREATE POLICY "Users can view public networking profiles" 
ON public.public_profiles 
FOR SELECT 
USING (true);