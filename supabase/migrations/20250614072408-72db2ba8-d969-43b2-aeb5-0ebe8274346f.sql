
-- Re-enable RLS on event_participants with working policies
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to see participants in their current event
-- This uses the profiles.current_event_id to avoid recursion
CREATE POLICY "Users can view participants in their current event"
  ON public.event_participants
  FOR SELECT
  USING (
    event_id = (
      SELECT current_event_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy for event hosts to view all participants in their events
CREATE POLICY "Hosts can view participants in their events"
  ON public.event_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.events 
      WHERE id = event_id 
      AND host_id = auth.uid()
    )
  );

-- Ensure profiles table has a policy that allows viewing profiles of event participants
-- This is crucial for the join in the networking query to work
CREATE POLICY "Users can view profiles of people in their events"
  ON public.profiles
  FOR SELECT
  USING (
    -- Allow viewing your own profile
    id = auth.uid()
    OR
    -- Allow viewing profiles of people in the same event
    public.user_can_see_profile(id)
  );
