
-- Add RLS policy for chat participants to view each other's profiles
-- This allows users who have sent messages in the same event to see each other's profiles

CREATE POLICY "Chat participants can view each other profiles"
ON profiles
FOR SELECT
USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1 
    FROM chat_messages cm1
    JOIN chat_messages cm2 ON cm1.event_id = cm2.event_id
    WHERE cm1.user_id = auth.uid() 
    AND cm2.user_id = profiles.id
  )
);
