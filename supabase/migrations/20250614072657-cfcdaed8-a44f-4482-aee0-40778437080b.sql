
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view participants in their current event" ON public.event_participants;
DROP POLICY IF EXISTS "Hosts can view participants in their events" ON public.event_participants;
DROP POLICY IF EXISTS "Users can view profiles of people in their events" ON public.profiles;

-- Create a much simpler approach for event_participants
-- Allow users to see participants in events they are also participating in
CREATE POLICY "Event participants can see other participants"
  ON public.event_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.event_participants my_participation
      WHERE my_participation.user_id = auth.uid()
      AND my_participation.event_id = event_participants.event_id
    )
  );

-- Allow event hosts to see all participants in their events
CREATE POLICY "Event hosts can see all participants"
  ON public.event_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.events 
      WHERE id = event_participants.event_id 
      AND host_id = auth.uid()
    )
  );

-- For profiles, create a simple policy that allows viewing profiles
-- of people in events where the current user is also a participant
CREATE POLICY "Users can view profiles in shared events"
  ON public.profiles
  FOR SELECT
  USING (
    -- Allow viewing your own profile
    id = auth.uid()
    OR
    -- Allow viewing profiles of people in events where you're both participants
    EXISTS (
      SELECT 1 
      FROM public.event_participants ep1
      JOIN public.event_participants ep2 ON ep1.event_id = ep2.event_id
      WHERE ep1.user_id = auth.uid() 
      AND ep2.user_id = profiles.id
    )
  );
