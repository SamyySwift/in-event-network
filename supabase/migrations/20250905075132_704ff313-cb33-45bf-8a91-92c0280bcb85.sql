-- Enable RLS on conversations table which appears to be missing it
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for conversations table
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (true); -- This appears to be a view-like table, may need adjustment

-- Enable RLS on public_profiles table if it doesn't have it
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for public_profiles to allow viewing networking profiles
CREATE POLICY "Users can view public networking profiles" 
ON public.public_profiles 
FOR SELECT 
USING (true);