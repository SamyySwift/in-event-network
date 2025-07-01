
-- Fix admin_wallets RLS policies to allow proper wallet operations during ticket purchases

-- First, drop all existing policies on admin_wallets
DROP POLICY IF EXISTS "Admin can view own wallet" ON admin_wallets;
DROP POLICY IF EXISTS "Admin can update own wallet" ON admin_wallets;
DROP POLICY IF EXISTS "System can create admin wallets" ON admin_wallets;
DROP POLICY IF EXISTS "System can update admin wallets" ON admin_wallets;

-- Create comprehensive policies that allow both admin access and system operations
CREATE POLICY "Admins can view their own wallets" ON admin_wallets
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admins can update their own wallets" ON admin_wallets
  FOR UPDATE USING (admin_id = auth.uid());

-- Allow system to create admin wallets (needed for trigger function)
CREATE POLICY "System can insert admin wallets" ON admin_wallets
  FOR INSERT WITH CHECK (true);

-- Allow system to update admin wallets (needed for trigger function)
CREATE POLICY "System can update all admin wallets" ON admin_wallets
  FOR UPDATE USING (true);

-- Ensure RLS is enabled
ALTER TABLE admin_wallets ENABLE ROW LEVEL SECURITY;
