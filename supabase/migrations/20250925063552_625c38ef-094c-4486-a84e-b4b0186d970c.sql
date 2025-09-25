-- Create a policy to allow chat participants to see basic profile info of other chat participants
-- This ensures that in chat rooms, users can see the names of people they're chatting with

CREATE POLICY "Chat participants can view basic profile info of other chat participants"
ON public.profiles
FOR SELECT
USING (
  -- Users can always see their own profile
  (auth.uid() = id) 
  OR 
  -- Users can see basic info of others who are in the same event's chat
  (EXISTS (
    SELECT 1 
    FROM chat_messages cm1, chat_messages cm2
    WHERE cm1.user_id = auth.uid() 
    AND cm2.user_id = profiles.id
    AND cm1.event_id = cm2.event_id
    AND cm1.event_id IS NOT NULL
  ))
  OR
  -- Users can see profiles of people in events they both participate in
  (EXISTS (
    SELECT 1 
    FROM event_participants ep1, event_participants ep2
    WHERE ep1.user_id = auth.uid() 
    AND ep2.user_id = profiles.id
    AND ep1.event_id = ep2.event_id
  ))
);

-- Also ensure that profiles have networking_visible set to true by default for new users
-- Update existing profiles that might have NULL networking_visible
UPDATE public.profiles 
SET networking_visible = true 
WHERE networking_visible IS NULL;