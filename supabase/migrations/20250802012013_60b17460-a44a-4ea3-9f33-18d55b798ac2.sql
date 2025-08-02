-- Fix wallet calculation by ensuring amounts are stored correctly in kobo
-- and preventing double conversion issues

-- Update the wallet trigger function to handle amounts correctly
CREATE OR REPLACE FUNCTION public.update_admin_wallet_on_purchase()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    admin_user_id UUID;
    amount_to_add NUMERIC;
    ticket_type_record RECORD;
BEGIN
    -- Skip wallet operations for free tickets (price = 0)
    IF NEW.price = 0 THEN
        RETURN NEW;
    END IF;
    
    -- Get ticket type information to determine the organizer receives amount
    SELECT organizer_receives, include_fees_in_price 
    INTO ticket_type_record
    FROM ticket_types 
    WHERE id = NEW.ticket_type_id;
    
    -- Use organizer_receives if available, otherwise use the full price
    -- Amount should be in kobo (already converted in frontend)
    IF ticket_type_record.organizer_receives IS NOT NULL THEN
        amount_to_add := ticket_type_record.organizer_receives;
    ELSE
        amount_to_add := NEW.price;
    END IF;
    
    -- Get the admin/host ID for this event
    SELECT host_id INTO admin_user_id FROM events WHERE id = NEW.event_id;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert or update admin wallet
        -- Convert from kobo to naira for wallet display (divide by 100)
        INSERT INTO admin_wallets (admin_id, event_id, total_earnings, available_balance)
        VALUES (admin_user_id, NEW.event_id, amount_to_add / 100, amount_to_add / 100)
        ON CONFLICT (admin_id, event_id) 
        DO UPDATE SET 
            total_earnings = admin_wallets.total_earnings + (amount_to_add / 100),
            available_balance = admin_wallets.available_balance + (amount_to_add / 100),
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$function$;