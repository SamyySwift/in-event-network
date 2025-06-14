
-- First, enable RLS on the event_participants table
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Users can join events" ON public.event_participants;
DROP POLICY IF EXISTS "Users can view their own event participations" ON public.event_participants;
DROP POLICY IF EXISTS "Admins can view all event participations" ON public.event_participants;
DROP POLICY IF EXISTS "Attendees can manage their own participation" ON public.event_participants;
DROP POLICY IF EXISTS "Hosts can see participants for their events" ON public.event_participants;

-- Create a function to check if user is an event host
CREATE OR REPLACE FUNCTION public.is_event_host(event_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_uuid AND host_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a function to check if user is participant in the same event
CREATE OR REPLACE FUNCTION public.is_same_event_participant(target_event_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.event_participants 
    WHERE event_id = target_event_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy for users to insert their own participation
CREATE POLICY "Users can join events" 
  ON public.event_participants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to view participants in events they're also participating in
CREATE POLICY "Participants can view other participants in same event" 
  ON public.event_participants 
  FOR SELECT 
  USING (public.is_same_event_participant(event_id));

-- Policy for event hosts to view all participants in their events
CREATE POLICY "Hosts can view participants in their events" 
  ON public.event_participants 
  FOR SELECT 
  USING (public.is_event_host(event_id));

-- Policy for users to update their own participation
CREATE POLICY "Users can update their own participation" 
  ON public.event_participants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to delete their own participation
CREATE POLICY "Users can leave events" 
  ON public.event_participants 
  FOR DELETE 
  USING (auth.uid() = user_id);
