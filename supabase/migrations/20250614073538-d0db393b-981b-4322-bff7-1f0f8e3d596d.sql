
-- Drop ALL existing policies on event_participants to start completely clean
DROP POLICY IF EXISTS "Users can join events" ON public.event_participants;
DROP POLICY IF EXISTS "Users can view current event participants" ON public.event_participants;
DROP POLICY IF EXISTS "Hosts can view their event participants" ON public.event_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.event_participants;
DROP POLICY IF EXISTS "Users can leave events" ON public.event_participants;
DROP POLICY IF EXISTS "Users can view profiles in current event" ON public.profiles;

-- Disable RLS temporarily to ensure we start clean
ALTER TABLE public.event_participants DISABLE ROW LEVEL SECURITY;

-- Create a simple function that gets the user's current event without recursion
CREATE OR REPLACE FUNCTION public.get_user_current_event_id()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT current_event_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Re-enable RLS
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies with unique names
-- Policy 1: Users can see participants in their current event
CREATE POLICY "Allow viewing current event participants"
  ON public.event_participants
  FOR SELECT
  USING (event_id = public.get_user_current_event_id());

-- Policy 2: Event hosts can see participants in their events
CREATE POLICY "Allow hosts to view event participants"
  ON public.event_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.events 
      WHERE id = event_id 
      AND host_id = auth.uid()
    )
  );

-- Policy 3: Allow inserting own participation
CREATE POLICY "Allow users to join events"
  ON public.event_participants
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Simple profiles policy - allow viewing profiles of people in the same current event
CREATE POLICY "Allow viewing profiles in current event"
  ON public.profiles
  FOR SELECT
  USING (
    -- Allow viewing your own profile
    id = auth.uid()
    OR
    -- Allow viewing profiles if both users have the same current_event_id
    (current_event_id IS NOT NULL 
     AND current_event_id = (SELECT current_event_id FROM public.profiles WHERE id = auth.uid()))
  );
