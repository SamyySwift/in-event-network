
-- First, let's check and fix the admin_wallets RLS policies
-- We need to allow the system to insert/update admin wallet records when tickets are purchased

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can view own wallet" ON admin_wallets;
DROP POLICY IF EXISTS "Admin can update own wallet" ON admin_wallets;
DROP POLICY IF EXISTS "System can manage admin wallets" ON admin_wallets;

-- Create policies that allow both admins and the system (via triggers) to manage wallet records
CREATE POLICY "Admin can view own wallet" ON admin_wallets
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admin can update own wallet" ON admin_wallets
  FOR UPDATE USING (admin_id = auth.uid());

-- Allow INSERT operations for wallet creation (this is needed for the trigger)
CREATE POLICY "System can create admin wallets" ON admin_wallets
  FOR INSERT WITH CHECK (true);

-- Allow UPDATE operations for wallet updates (this is needed for the trigger)
CREATE POLICY "System can update admin wallets" ON admin_wallets
  FOR UPDATE USING (true);

-- Also ensure RLS is enabled
ALTER TABLE admin_wallets ENABLE ROW LEVEL SECURITY;
