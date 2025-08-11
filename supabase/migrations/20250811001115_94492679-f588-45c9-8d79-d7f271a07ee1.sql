-- Prevent double-crediting: update wallet only once per ticket when payment becomes completed
CREATE OR REPLACE FUNCTION public.update_admin_wallet_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    admin_user_id UUID;
    amount_to_add NUMERIC;
    ticket_type_record RECORD;
    should_credit BOOLEAN := false;
BEGIN
    -- Decide if we should credit based on the triggering operation
    IF TG_OP = 'INSERT' THEN
        should_credit := (NEW.payment_status = 'completed');
    ELSIF TG_OP = 'UPDATE' THEN
        should_credit := (NEW.payment_status = 'completed' AND (OLD.payment_status IS DISTINCT FROM 'completed'));
    END IF;

    -- If not a qualifying transition, exit
    IF NOT should_credit THEN
        RETURN NEW;
    END IF;

    -- Skip wallet operations for free tickets
    IF NEW.price = 0 THEN
        RETURN NEW;
    END IF;

    -- Determine organizer's amount (in kobo)
    SELECT organizer_receives, include_fees_in_price
      INTO ticket_type_record
      FROM ticket_types
     WHERE id = NEW.ticket_type_id;

    IF ticket_type_record.organizer_receives IS NOT NULL THEN
        amount_to_add := ticket_type_record.organizer_receives;
    ELSE
        amount_to_add := NEW.price;
    END IF;

    -- Get host/admin id for the event
    SELECT host_id INTO admin_user_id FROM events WHERE id = NEW.event_id;

    IF admin_user_id IS NOT NULL THEN
        -- Store amounts in naira in admin_wallets (divide kobo by 100)
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

-- Re-sync existing wallets from completed ticket sales to ensure correctness
WITH revenue AS (
  SELECT 
    e.host_id AS admin_id,
    et.event_id,
    SUM(COALESCE(tt.organizer_receives, et.price)) AS amount_kobo
  FROM public.event_tickets et
  JOIN public.events e ON e.id = et.event_id
  LEFT JOIN public.ticket_types tt ON tt.id = et.ticket_type_id
  WHERE et.payment_status = 'completed'
  GROUP BY e.host_id, et.event_id
)
UPDATE public.admin_wallets w
SET 
  total_earnings = GREATEST(0, (COALESCE(r.amount_kobo, 0) / 100)::int),
  available_balance = GREATEST(0, GREATEST(0, (COALESCE(r.amount_kobo, 0) / 100)::int) - w.withdrawn_amount),
  updated_at = now()
FROM revenue r
WHERE w.admin_id = r.admin_id AND w.event_id = r.event_id;