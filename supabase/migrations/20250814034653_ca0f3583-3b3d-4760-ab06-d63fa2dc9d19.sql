-- Fix RLS policies for event_access_codes to allow users to read their own access codes
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Event hosts can view access codes for their events" ON public.event_access_codes;

-- Add policy for users to read access codes they've unlocked
CREATE POLICY "Users can view access codes they've unlocked" 
ON public.event_access_codes 
FOR SELECT 
USING (unlocked_by_user_id = auth.uid());

-- Keep the policy for event hosts to see all access codes for their events
CREATE POLICY "Event hosts can view access codes for their events" 
ON public.event_access_codes 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM events
  WHERE ((events.id = event_access_codes.event_id) AND (events.host_id = auth.uid()))));

-- Allow users to update access codes (needed for the query to work properly)
CREATE POLICY "Users can update their own access code entries"
ON public.event_access_codes
FOR UPDATE
USING (unlocked_by_user_id = auth.uid());