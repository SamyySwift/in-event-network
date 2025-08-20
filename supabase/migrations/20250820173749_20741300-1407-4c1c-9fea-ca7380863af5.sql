-- Drop overly permissive policies that allow public access to all profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "authenticated can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "pr_public_read" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

-- Create secure policies for profile access
-- Policy 1: Users can always view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Event participants can view other participants' profiles (networking within events)
CREATE POLICY "Event participants can view other participants in same events"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM event_participants ep1
    JOIN event_participants ep2 ON ep1.event_id = ep2.event_id
    WHERE ep1.user_id = auth.uid() 
    AND ep2.user_id = profiles.id
    AND profiles.networking_visible = true
  )
);

-- Policy 3: Event hosts can view profiles of their event participants
CREATE POLICY "Event hosts can view their event participants profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM event_participants ep
    JOIN events e ON ep.event_id = e.id
    WHERE ep.user_id = profiles.id
    AND e.host_id = auth.uid()
  )
);

-- Policy 4: Super admins can view all profiles for administrative purposes
CREATE POLICY "Super admins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_super_admin());

-- Clean up duplicate update policies - keep only the most restrictive one
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Keep only one clear update policy
CREATE POLICY "Users can update their own profile only"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);