-- Add DELETE policy for direct_messages table
-- This allows users to delete messages they sent
CREATE POLICY "Users can delete their own direct messages"
ON public.direct_messages
FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);
