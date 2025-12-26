-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Chat participants can view each other profiles" ON profiles;

-- Create a new, more permissive policy for chat visibility
CREATE POLICY "Users can view profiles in their events"
ON profiles
FOR SELECT
USING (
  -- Can always view own profile
  auth.uid() = id
  OR
  -- Can view profiles of users who sent messages in events you participate in
  EXISTS (
    SELECT 1 
    FROM chat_messages cm
    JOIN event_participants ep ON cm.event_id = ep.event_id
    WHERE cm.user_id = profiles.id 
    AND ep.user_id = auth.uid()
  )
  OR
  -- Can view profiles of other participants in your events
  EXISTS (
    SELECT 1 
    FROM event_participants ep1
    JOIN event_participants ep2 ON ep1.event_id = ep2.event_id
    WHERE ep1.user_id = auth.uid() 
    AND ep2.user_id = profiles.id
  )
);