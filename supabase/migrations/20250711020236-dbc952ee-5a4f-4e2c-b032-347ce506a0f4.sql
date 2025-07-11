-- Fix admin_wallets RLS policies and triggers for ticket purchase
-- First, drop all existing policies that might be conflicting
DROP POLICY IF EXISTS "Admin can view own wallet" ON admin_wallets;
DROP POLICY IF EXISTS "Admin can update own wallet" ON admin_wallets;
DROP POLICY IF EXISTS "Admins can manage their own wallets" ON admin_wallets;
DROP POLICY IF EXISTS "Admins can view their own wallets" ON admin_wallets;
DROP POLICY IF EXISTS "System can create admin wallets" ON admin_wallets;
DROP POLICY IF EXISTS "System can update admin wallets" ON admin_wallets;

-- Create clear, non-conflicting policies
CREATE POLICY "Admins can view their own wallets" ON admin_wallets
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admins can update their own wallets" ON admin_wallets
  FOR UPDATE USING (admin_id = auth.uid());

-- Allow system operations for ticket purchases (bypasses RLS)
CREATE POLICY "System can insert admin wallets" ON admin_wallets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update all admin wallets" ON admin_wallets
  FOR UPDATE USING (true);

-- Ensure the trigger function works properly
CREATE OR REPLACE FUNCTION public.update_admin_wallet_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Skip wallet operations for free tickets (price = 0)
    IF NEW.price = 0 THEN
        RETURN NEW;
    END IF;
    
    -- Get the admin/host ID for this event
    SELECT host_id INTO admin_user_id FROM events WHERE id = NEW.event_id;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert or update admin wallet for paid tickets only
        INSERT INTO admin_wallets (admin_id, event_id, total_earnings, available_balance)
        VALUES (admin_user_id, NEW.event_id, NEW.price, NEW.price)
        ON CONFLICT (admin_id, event_id) 
        DO UPDATE SET 
            total_earnings = admin_wallets.total_earnings + NEW.price,
            available_balance = admin_wallets.available_balance + NEW.price,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS trigger_update_admin_wallet_on_purchase ON event_tickets;
CREATE TRIGGER trigger_update_admin_wallet_on_purchase
    AFTER INSERT ON event_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_wallet_on_purchase();

-- Add RLS policies for ticket_form_responses if they don't exist
ALTER TABLE ticket_form_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view form responses for their events" ON ticket_form_responses;
DROP POLICY IF EXISTS "Users can view their own ticket form responses" ON ticket_form_responses;
DROP POLICY IF EXISTS "System can insert form responses" ON ticket_form_responses;

-- Create policies for ticket form responses
CREATE POLICY "Admins can view form responses for their events" ON ticket_form_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_tickets et
      JOIN events e ON et.event_id = e.id
      WHERE et.id = ticket_form_responses.ticket_id
      AND e.host_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own ticket form responses" ON ticket_form_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_tickets et
      WHERE et.id = ticket_form_responses.ticket_id
      AND et.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert form responses" ON ticket_form_responses
  FOR INSERT WITH CHECK (true);