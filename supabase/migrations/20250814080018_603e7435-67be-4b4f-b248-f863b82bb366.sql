-- Update RLS policies for event_access_codes to allow anonymous access
DROP POLICY IF EXISTS "Authenticated users can create access code entries" ON event_access_codes;
DROP POLICY IF EXISTS "Users can view access codes they've unlocked" ON event_access_codes;
DROP POLICY IF EXISTS "Users can update their own access code entries" ON event_access_codes;

-- Allow anyone to create access code entries (for anonymous referral code usage)
CREATE POLICY "Anyone can create access code entries" 
ON event_access_codes 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to view access codes (for checking unlock status)
CREATE POLICY "Anyone can view access codes" 
ON event_access_codes 
FOR SELECT 
USING (true);

-- Allow anyone to update access codes
CREATE POLICY "Anyone can update access codes" 
ON event_access_codes 
FOR UPDATE 
USING (true);

-- Event hosts can still view access codes for their events (keep this policy)
-- This policy already exists and should remain