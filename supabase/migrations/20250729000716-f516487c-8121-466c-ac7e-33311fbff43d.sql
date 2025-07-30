-- Fix the currency mismatch in the wallet trigger
-- Remove the incorrect division by 100 that was causing the mismatch
CREATE OR REPLACE FUNCTION public.update_admin_wallet_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    admin_user_id UUID;
    amount_to_add NUMERIC;
BEGIN
    -- Skip wallet operations for free tickets (price = 0)
    IF NEW.price = 0 THEN
        RETURN NEW;
    END IF;
    
    -- Use price directly (already in correct format - kobo)
    amount_to_add := NEW.price;
    
    -- Get the admin/host ID for this event
    SELECT host_id INTO admin_user_id FROM events WHERE id = NEW.event_id;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert or update admin wallet
        -- Use amount_to_add directly without conversion
        INSERT INTO admin_wallets (admin_id, event_id, total_earnings, available_balance)
        VALUES (admin_user_id, NEW.event_id, amount_to_add, amount_to_add)
        ON CONFLICT (admin_id, event_id) 
        DO UPDATE SET 
            total_earnings = admin_wallets.total_earnings + amount_to_add,
            available_balance = admin_wallets.available_balance + amount_to_add,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Add fee management columns to ticket_types table
ALTER TABLE public.ticket_types 
ADD COLUMN IF NOT EXISTS include_fees_in_price boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS service_fee_percentage decimal(5,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS payment_gateway_fee_percentage decimal(5,2) DEFAULT 1.50,
ADD COLUMN IF NOT EXISTS payment_gateway_fixed_fee integer DEFAULT 10000,
ADD COLUMN IF NOT EXISTS display_price integer,
ADD COLUMN IF NOT EXISTS organizer_receives integer;

-- Create function to calculate fees and pricing
CREATE OR REPLACE FUNCTION public.calculate_ticket_pricing(
    base_price integer,
    include_fees boolean DEFAULT false,
    service_fee_pct decimal DEFAULT 5.00,
    gateway_fee_pct decimal DEFAULT 1.50,
    gateway_fixed_fee integer DEFAULT 10000
)
RETURNS TABLE(
    display_price integer,
    organizer_receives integer,
    total_fees integer,
    service_fee integer,
    gateway_fee integer
)
LANGUAGE plpgsql
AS $function$
DECLARE
    calc_service_fee integer;
    calc_gateway_fee integer;
    calc_total_fees integer;
    calc_display_price integer;
    calc_organizer_receives integer;
BEGIN
    IF include_fees THEN
        -- Fees are included in the base price
        -- Calculate what the organizer receives after fees are deducted
        calc_service_fee := ROUND(base_price * service_fee_pct / 100.0);
        calc_gateway_fee := ROUND(base_price * gateway_fee_pct / 100.0) + gateway_fixed_fee;
        calc_total_fees := calc_service_fee + calc_gateway_fee;
        calc_display_price := base_price;
        calc_organizer_receives := base_price - calc_total_fees;
    ELSE
        -- Organizer absorbs fees, attendee pays the base price
        calc_service_fee := 0;
        calc_gateway_fee := 0;
        calc_total_fees := 0;
        calc_display_price := base_price;
        calc_organizer_receives := base_price;
    END IF;
    
    RETURN QUERY SELECT 
        calc_display_price,
        calc_organizer_receives,
        calc_total_fees,
        calc_service_fee,
        calc_gateway_fee;
END;
$function$;

-- Create trigger to auto-calculate pricing when ticket types are updated
CREATE OR REPLACE FUNCTION public.update_ticket_pricing()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    pricing_result record;
BEGIN
    -- Calculate pricing based on the fee inclusion setting
    SELECT * INTO pricing_result 
    FROM calculate_ticket_pricing(
        NEW.price,
        COALESCE(NEW.include_fees_in_price, false),
        COALESCE(NEW.service_fee_percentage, 5.00),
        COALESCE(NEW.payment_gateway_fee_percentage, 1.50),
        COALESCE(NEW.payment_gateway_fixed_fee, 10000)
    );
    
    -- Update the calculated fields
    NEW.display_price := pricing_result.display_price;
    NEW.organizer_receives := pricing_result.organizer_receives;
    
    RETURN NEW;
END;
$function$;

-- Create trigger for automatic pricing calculation
DROP TRIGGER IF EXISTS trigger_update_ticket_pricing ON public.ticket_types;
CREATE TRIGGER trigger_update_ticket_pricing
    BEFORE INSERT OR UPDATE ON public.ticket_types
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ticket_pricing();

-- Update existing ticket types with default values
UPDATE public.ticket_types 
SET 
    include_fees_in_price = false,
    service_fee_percentage = 5.00,
    payment_gateway_fee_percentage = 1.50,
    payment_gateway_fixed_fee = 10000,
    display_price = price,
    organizer_receives = price
WHERE include_fees_in_price IS NULL;