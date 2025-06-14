
-- Drop the policies I created
DROP POLICY IF EXISTS "Allow viewing current event participants" ON public.event_participants;
DROP POLICY IF EXISTS "Allow hosts to view event participants" ON public.event_participants;
DROP POLICY IF EXISTS "Allow users to join events" ON public.event_participants;
DROP POLICY IF EXISTS "Allow viewing profiles in current event" ON public.profiles;

-- Drop the function I created
DROP FUNCTION IF EXISTS public.get_user_current_event_id();

-- Disable RLS on event_participants (this was the original state causing the recursion)
ALTER TABLE public.event_participants DISABLE ROW LEVEL SECURITY;

-- Restore the original RLS state on profiles (it was already enabled)
-- No change needed for profiles table RLS status
