-- Fix admin chat participation issue
-- Problem: Admins cannot send messages because they're not added as event participants

BEGIN;

-- 1) Create function to automatically add event hosts as participants
CREATE OR REPLACE FUNCTION public.add_host_as_participant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add the event host as a participant when an event is created
  INSERT INTO public.event_participants (event_id, user_id, joined_at)
  VALUES (NEW.id, NEW.host_id, now())
  ON CONFLICT (event_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 2) Create trigger to automatically add hosts as participants
DROP TRIGGER IF EXISTS trigger_add_host_as_participant ON public.events;
CREATE TRIGGER trigger_add_host_as_participant
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.add_host_as_participant();

-- 3) Backfill existing events - add all existing hosts as participants
INSERT INTO public.event_participants (event_id, user_id, joined_at)
SELECT 
  e.id as event_id,
  e.host_id as user_id,
  e.created_at as joined_at
FROM public.events e
WHERE e.host_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.event_participants ep 
    WHERE ep.event_id = e.id AND ep.user_id = e.host_id
  );

-- 4) Enable RLS on chat_messages table for better security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 5) Create RLS policies for chat_messages
-- Allow event participants to view messages for their events
DROP POLICY IF EXISTS "Event participants can view chat messages" ON public.chat_messages;
CREATE POLICY "Event participants can view chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.event_participants ep
    WHERE ep.event_id = chat_messages.event_id 
    AND ep.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = chat_messages.event_id 
    AND e.host_id = auth.uid()
  )
);

-- Allow event participants to insert messages for their events
DROP POLICY IF EXISTS "Event participants can send chat messages" ON public.chat_messages;
CREATE POLICY "Event participants can send chat messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    EXISTS (
      SELECT 1 FROM public.event_participants ep
      WHERE ep.event_id = chat_messages.event_id 
      AND ep.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = chat_messages.event_id 
      AND e.host_id = auth.uid()
    )
  )
);

-- Allow users to delete their own messages
DROP POLICY IF EXISTS "Users can delete their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can delete their own chat messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = chat_messages.event_id 
    AND e.host_id = auth.uid()
  )
);

-- Allow users to update their own messages
DROP POLICY IF EXISTS "Users can update their own chat messages" ON public.chat_messages;
CREATE POLICY "Users can update their own chat messages"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

COMMIT;