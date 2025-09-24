-- Fix infinite recursion in event_participants RLS policies
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Event hosts can manage participants" ON event_participants;
DROP POLICY IF EXISTS "Event hosts can see all participants" ON event_participants;
DROP POLICY IF EXISTS "Event participants can see other participants" ON event_participants;
DROP POLICY IF EXISTS "Hosts can manage participants of their events" ON event_participants;
DROP POLICY IF EXISTS "Hosts can remove participants from their events" ON event_participants;
DROP POLICY IF EXISTS "Hosts can view their event participants" ON event_participants;
DROP POLICY IF EXISTS "Participants can view own rows" ON event_participants;
DROP POLICY IF EXISTS "Users can insert themselves as participants" ON event_participants;
DROP POLICY IF EXISTS "Users can join events as themselves" ON event_participants;
DROP POLICY IF EXISTS "Users can leave their own participation" ON event_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON event_participants;
DROP POLICY IF EXISTS "Users can view participants in events they host or participate" ON event_participants;
DROP POLICY IF EXISTS "attendees can view all participants in the same event" ON event_participants;
DROP POLICY IF EXISTS "ep_admin_read" ON event_participants;
DROP POLICY IF EXISTS "ep_attendee_read_same_event" ON event_participants;
DROP POLICY IF EXISTS "ep_user_insert_self" ON event_participants;
DROP POLICY IF EXISTS "event_participants_select_self_or_host" ON event_participants;

-- Create clean, non-recursive policies
CREATE POLICY "Users can join events"
ON event_participants FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave events"
ON event_participants FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Users can view their own participation"
ON event_participants FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Event hosts can view all participants"
ON event_participants FOR SELECT
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_participants.event_id 
  AND events.host_id = auth.uid()
));

CREATE POLICY "Event hosts can manage participants"
ON event_participants FOR ALL
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_participants.event_id 
  AND events.host_id = auth.uid()
));

CREATE POLICY "Participants can see other participants in same event"
ON event_participants FOR SELECT
USING (EXISTS (
  SELECT 1 FROM event_participants AS my_participation
  WHERE my_participation.event_id = event_participants.event_id 
  AND my_participation.user_id = auth.uid()
));