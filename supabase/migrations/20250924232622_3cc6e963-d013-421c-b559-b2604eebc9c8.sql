-- Fix recursive RLS on event_participants and add safe policies
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Participants can view own rows" ON public.event_participants;
DROP POLICY IF EXISTS "Hosts can view their event participants" ON public.event_participants; 
DROP POLICY IF EXISTS "Users can join events as themselves" ON public.event_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.event_participants;
DROP POLICY IF EXISTS "Hosts can manage participants of their events" ON public.event_participants;
DROP POLICY IF EXISTS "Users can leave their own participation" ON public.event_participants;
DROP POLICY IF EXISTS "Hosts can remove participants from their events" ON public.event_participants;

-- Ensure RLS is enabled
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Create safe, non-recursive policies
CREATE POLICY "Participants can view own rows"
ON public.event_participants
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Hosts can view their event participants"  
ON public.event_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = event_participants.event_id
      AND e.host_id = auth.uid()
  )
);

CREATE POLICY "Users can join events as themselves"
ON public.event_participants
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
ON public.event_participants
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Hosts can manage participants of their events"
ON public.event_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = event_participants.event_id
      AND e.host_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = event_participants.event_id
      AND e.host_id = auth.uid()
  )
);

CREATE POLICY "Users can leave their own participation"
ON public.event_participants
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Hosts can remove participants from their events"
ON public.event_participants
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = event_participants.event_id
      AND e.host_id = auth.uid()
  )
);