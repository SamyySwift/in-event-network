-- Remove the overly permissive public read policy
DROP POLICY IF EXISTS "Anyone can view access codes" ON public.event_access_codes;

-- Keep the policy for event hosts to view their own codes
-- Already exists: "Event hosts can view access codes for their events"

-- Users can only see their own unlocked codes
CREATE POLICY "Users can view their own unlocked codes"
ON public.event_access_codes
FOR SELECT
USING (unlocked_by_user_id = auth.uid());