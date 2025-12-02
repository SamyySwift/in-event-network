-- Fix "Unknown User" issue: Allow event participants to view each other's profiles
-- Drop the restrictive policy that requires users to have sent messages first
DROP POLICY IF EXISTS "Chat participants can view basic profile info of other chat par" ON profiles;

-- Create a new policy that allows event participants to see each other's profiles
-- This allows attendees to see who sent a message even before they send their own message
CREATE POLICY "Event participants can view each other profiles"
ON profiles FOR SELECT
USING (
  -- Users can always see their own profile
  auth.uid() = id
  OR
  -- Users can see profiles of people who are in the same event as them
  EXISTS (
    SELECT 1 FROM event_participants ep1
    JOIN event_participants ep2 ON ep1.event_id = ep2.event_id
    WHERE ep1.user_id = auth.uid() 
    AND ep2.user_id = profiles.id
  )
  OR
  -- Event hosts can see profiles of their event participants
  EXISTS (
    SELECT 1 FROM events e
    JOIN event_participants ep ON e.id = ep.event_id
    WHERE e.host_id = auth.uid()
    AND ep.user_id = profiles.id
  )
);