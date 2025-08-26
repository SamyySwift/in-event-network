-- Add RLS policy to allow event hosts to view connections between their event participants
CREATE POLICY "Event hosts can view connections between their participants"
ON public.connections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM events e
    JOIN event_participants ep1 ON e.id = ep1.event_id
    JOIN event_participants ep2 ON e.id = ep2.event_id
    WHERE e.host_id = auth.uid()
    AND ep1.user_id = connections.requester_id
    AND ep2.user_id = connections.recipient_id
  )
);