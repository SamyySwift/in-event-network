
-- Phase 1: Clean up test data and fix balance issues

-- Reset all admin wallet balances to zero to remove test data
UPDATE admin_wallets SET 
  available_balance = 0,
  total_earnings = 0,
  withdrawn_amount = 0,
  last_payout_at = NULL
WHERE available_balance > 0 OR total_earnings > 0;

-- Fix the admin wallet trigger to handle amounts properly and prevent doubling
CREATE OR REPLACE FUNCTION public.update_admin_wallet_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    admin_user_id UUID;
    amount_in_naira NUMERIC;
BEGIN
    -- Skip wallet operations for free tickets (price = 0)
    IF NEW.price = 0 THEN
        RETURN NEW;
    END IF;
    
    -- Convert price from kobo to naira (divide by 100)
    amount_in_naira := NEW.price / 100.0;
    
    -- Get the admin/host ID for this event
    SELECT host_id INTO admin_user_id FROM events WHERE id = NEW.event_id;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert or update admin wallet for paid tickets only
        -- Use amount_in_naira to ensure proper conversion
        INSERT INTO admin_wallets (admin_id, event_id, total_earnings, available_balance)
        VALUES (admin_user_id, NEW.event_id, amount_in_naira, amount_in_naira)
        ON CONFLICT (admin_id, event_id) 
        DO UPDATE SET 
            total_earnings = admin_wallets.total_earnings + amount_in_naira,
            available_balance = admin_wallets.available_balance + amount_in_naira,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Add proper constraints to prevent negative balances
ALTER TABLE admin_wallets 
ADD CONSTRAINT check_available_balance_non_negative 
CHECK (available_balance >= 0);

ALTER TABLE admin_wallets 
ADD CONSTRAINT check_total_earnings_non_negative 
CHECK (total_earnings >= 0);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_wallets_admin_event 
ON admin_wallets(admin_id, event_id);

-- Update withdrawal_requests table to track amounts in naira
ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS amount_naira NUMERIC DEFAULT 0;

-- Update existing withdrawal requests to have proper naira amounts
UPDATE withdrawal_requests 
SET amount_naira = amount / 100.0 
WHERE amount_naira = 0 AND amount > 0;
