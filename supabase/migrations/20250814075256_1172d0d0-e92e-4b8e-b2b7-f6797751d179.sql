-- Fix RLS and policies for event_access_codes table
ALTER TABLE public.event_access_codes ENABLE ROW LEVEL SECURITY;

-- Ensure users can insert their own access codes
DROP POLICY IF EXISTS "Authenticated users can create access code entries" ON public.event_access_codes;
CREATE POLICY "Authenticated users can create access code entries" 
ON public.event_access_codes 
FOR INSERT 
WITH CHECK (auth.uid() = unlocked_by_user_id);

-- Ensure users can read their own access codes
DROP POLICY IF EXISTS "Users can view access codes they've unlocked" ON public.event_access_codes;
CREATE POLICY "Users can view access codes they've unlocked" 
ON public.event_access_codes 
FOR SELECT 
USING (auth.uid() = unlocked_by_user_id);

-- Ensure event hosts can view access codes for their events
DROP POLICY IF EXISTS "Event hosts can view access codes for their events" ON public.event_access_codes;
CREATE POLICY "Event hosts can view access codes for their events" 
ON public.event_access_codes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_access_codes.event_id 
  AND events.host_id = auth.uid()
));

-- Add a policy for users to update their own access codes
DROP POLICY IF EXISTS "Users can update their own access code entries" ON public.event_access_codes;
CREATE POLICY "Users can update their own access code entries" 
ON public.event_access_codes 
FOR UPDATE 
USING (auth.uid() = unlocked_by_user_id);