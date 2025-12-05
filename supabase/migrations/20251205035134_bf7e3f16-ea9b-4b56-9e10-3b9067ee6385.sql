-- Allow users to view profiles of people they have direct messages with
CREATE POLICY "Users can view profiles of direct message participants"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM direct_messages dm
    WHERE (dm.sender_id = auth.uid() AND dm.recipient_id = profiles.id)
       OR (dm.recipient_id = auth.uid() AND dm.sender_id = profiles.id)
  )
);