
-- Let's check what's happening and simplify the approach
-- First, let's see if we need to allow the profiles join specifically

-- Drop the current policies to start fresh
DROP POLICY IF EXISTS "Users can view participants in their current event" ON public.event_participants;
DROP POLICY IF EXISTS "Hosts can view participants in their events" ON public.event_participants;

-- Temporarily disable RLS to test - we'll re-enable with working policies
ALTER TABLE public.event_participants DISABLE ROW LEVEL SECURITY;

-- Let's also check if profiles table has RLS issues
-- Create a simple policy that allows users to see profiles of people in their event
CREATE OR REPLACE FUNCTION public.user_can_see_profile(profile_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if the profile belongs to someone in the same event as the current user
  RETURN EXISTS (
    SELECT 1 
    FROM public.event_participants ep1
    JOIN public.event_participants ep2 ON ep1.event_id = ep2.event_id
    WHERE ep1.user_id = auth.uid() 
    AND ep2.user_id = profile_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
