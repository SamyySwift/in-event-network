-- Remove the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Participants can see other participants in same event" ON event_participants;

-- Remove any other problematic policies that might reference event_participants recursively
DROP POLICY IF EXISTS "Participants can see others in same event" ON event_participants;

-- Create a simple policy that avoids recursion by only allowing users to see their own participation
-- and letting event hosts see all participants (using existing is_event_host function)
CREATE POLICY "Users can view event participants"
ON event_participants FOR SELECT
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_participants.event_id 
    AND events.host_id = auth.uid()
  )
);