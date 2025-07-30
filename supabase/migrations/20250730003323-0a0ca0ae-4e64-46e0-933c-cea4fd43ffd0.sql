-- Fix the calculate_ticket_pricing function to handle fees correctly
CREATE OR REPLACE FUNCTION public.calculate_ticket_pricing(
    base_price integer, 
    include_fees boolean DEFAULT false, 
    service_fee_pct numeric DEFAULT 5.00, 
    gateway_fee_pct numeric DEFAULT 1.50, 
    gateway_fixed_fee integer DEFAULT 10000
)
RETURNS TABLE(display_price integer, organizer_receives integer, total_fees integer, service_fee integer, gateway_fee integer)
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
        -- Fees are added on top - attendee pays more, organizer gets full base price
        calc_service_fee := ROUND(base_price * service_fee_pct / 100.0);
        calc_gateway_fee := ROUND(base_price * gateway_fee_pct / 100.0) + gateway_fixed_fee;
        calc_total_fees := calc_service_fee + calc_gateway_fee;
        calc_display_price := base_price + calc_total_fees;
        calc_organizer_receives := base_price;
    ELSE
        -- Organizer absorbs fees - attendee pays base price, organizer gets less
        calc_service_fee := ROUND(base_price * service_fee_pct / 100.0);
        calc_gateway_fee := ROUND(base_price * gateway_fee_pct / 100.0) + gateway_fixed_fee;
        calc_total_fees := calc_service_fee + calc_gateway_fee;
        calc_display_price := base_price;
        calc_organizer_receives := base_price - calc_total_fees;
    END IF;
    
    RETURN QUERY SELECT 
        calc_display_price,
        calc_organizer_receives,
        calc_total_fees,
        calc_service_fee,
        calc_gateway_fee;
END;
$function$;