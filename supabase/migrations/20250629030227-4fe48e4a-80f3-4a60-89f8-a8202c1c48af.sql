
-- Update the admin wallet trigger to handle free tickets properly
CREATE OR REPLACE FUNCTION public.update_admin_wallet_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
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
$function$
