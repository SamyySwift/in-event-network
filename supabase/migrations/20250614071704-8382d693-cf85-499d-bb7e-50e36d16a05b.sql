
-- Drop the problematic function and policies
DROP POLICY IF EXISTS "Participants can view other participants in same event" ON public.event_participants;
DROP POLICY IF EXISTS "Hosts can view participants in their events" ON public.event_participants;
DROP FUNCTION IF EXISTS public.is_same_event_participant(uuid);

-- Create a new approach: use the profiles table to get current_event_id
-- This avoids querying event_participants within the RLS policy
CREATE OR REPLACE FUNCTION public.get_user_current_event()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT current_event_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policy for users to view participants in their current event
CREATE POLICY "Users can view participants in their current event" 
  ON public.event_participants 
  FOR SELECT 
  USING (event_id = public.get_user_current_event());

-- Policy for event hosts to view all participants in their events  
CREATE POLICY "Hosts can view participants in their events" 
  ON public.event_participants 
  FOR SELECT 
  USING (public.is_event_host(event_id));
