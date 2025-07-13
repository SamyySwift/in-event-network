-- Allow users to delete their own tickets
CREATE POLICY "Users can delete their own tickets" 
ON public.event_tickets 
FOR DELETE 
USING (auth.uid() = user_id);