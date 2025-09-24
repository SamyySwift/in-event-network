BEGIN;

-- Ensure RLS is enabled (safe if already on)
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to SELECT:
-- - their own participant rows
-- - any participant rows for events they host
DROP POLICY IF EXISTS event_participants_select_self_or_host ON public.event_participants;
CREATE POLICY event_participants_select_self_or_host
ON public.event_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = event_participants.event_id
      AND e.host_id = auth.uid()
  )
);

COMMIT;