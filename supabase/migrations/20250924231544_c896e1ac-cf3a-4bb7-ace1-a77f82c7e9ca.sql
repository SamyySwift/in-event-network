-- Fix infinite recursion in event_participants RLS policy
-- This is causing 500 errors and preventing admin access

-- Drop existing problematic policies
DROP POLICY IF EXISTS "event_participants_policy" ON event_participants;
DROP POLICY IF EXISTS "Users can view event participants" ON event_participants;
DROP POLICY IF EXISTS "Users can manage participants in their events" ON event_participants;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view participants in events they host or participate in" 
ON event_participants FOR SELECT 
USING (
  user_id = auth.uid() OR 
  event_id IN (
    SELECT id FROM events WHERE host_id = auth.uid()
  )
);

CREATE POLICY "Users can insert themselves as participants" 
ON event_participants FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Event hosts can manage participants" 
ON event_participants FOR ALL 
USING (
  event_id IN (
    SELECT id FROM events WHERE host_id = auth.uid()
  )
);

-- Fix user role - ensure this specific user is set as host
UPDATE profiles 
SET role = 'host' 
WHERE email = 'liana@gmail.com';

-- Also update their auth metadata to be consistent
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{role}',
  '"host"'
)
WHERE email = 'liana@gmail.com';