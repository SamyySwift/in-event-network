-- Idempotent wallet credits: ensure only one credit per ticket and recompute balances
BEGIN;

-- 1) Ensure unique wallet per admin/event for upserts to work safely
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_wallets_unique ON public.admin_wallets(admin_id, event_id);

-- 2) Create a credits ledger to guarantee single credit per ticket
CREATE TABLE IF NOT EXISTS public.admin_wallet_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL UNIQUE,
  event_id uuid NOT NULL,
  admin_id uuid NOT NULL,
  amount_naira integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_wallet_credits_admin_event ON public.admin_wallet_credits(admin_id, event_id);

-- 3) Replace wallet update function to be idempotent via credits ledger
CREATE OR REPLACE FUNCTION public.update_admin_wallet_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  admin_user_id uuid;
  amount_kobo numeric;
  amount_naira integer;
  ticket_type_record RECORD;
  new_credit_id uuid;
  should_credit boolean := false;
BEGIN
  -- Determine if we should credit based on operation and status transition
  IF TG_OP = 'INSERT' THEN
    should_credit := (NEW.payment_status = 'completed');
  ELSIF TG_OP = 'UPDATE' THEN
    should_credit := (NEW.payment_status = 'completed' AND (OLD.payment_status IS DISTINCT FROM 'completed'));
  END IF;

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
    FROM public.ticket_types
   WHERE id = NEW.ticket_type_id;

  IF ticket_type_record.organizer_receives IS NOT NULL THEN
    amount_kobo := ticket_type_record.organizer_receives;
  ELSE
    amount_kobo := NEW.price;
  END IF;

  amount_naira := (amount_kobo / 100)::int;

  -- Get host/admin id for the event
  SELECT host_id INTO admin_user_id FROM public.events WHERE id = NEW.event_id;

  -- Record credit once per ticket; if it already exists, do nothing
  INSERT INTO public.admin_wallet_credits(ticket_id, event_id, admin_id, amount_naira)
  VALUES (NEW.id, NEW.event_id, admin_user_id, amount_naira)
  ON CONFLICT (ticket_id) DO NOTHING
  RETURNING id INTO new_credit_id;

  -- If credit already existed, skip wallet update
  IF new_credit_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Upsert into wallets (amounts stored in naira)
  INSERT INTO public.admin_wallets (admin_id, event_id, total_earnings, available_balance)
  VALUES (admin_user_id, NEW.event_id, amount_naira, amount_naira)
  ON CONFLICT (admin_id, event_id)
  DO UPDATE SET
    total_earnings = public.admin_wallets.total_earnings + EXCLUDED.total_earnings,
    available_balance = public.admin_wallets.available_balance + EXCLUDED.available_balance,
    updated_at = now();

  RETURN NEW;
END;
$function$;

-- 4) Ensure proper triggers exist (drop old, if any) and recreate as AFTER triggers
DROP TRIGGER IF EXISTS trg_wallet_credit_on_ticket_insert ON public.event_tickets;
DROP TRIGGER IF EXISTS trg_wallet_credit_on_ticket_update ON public.event_tickets;

CREATE TRIGGER trg_wallet_credit_on_ticket_insert
AFTER INSERT ON public.event_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_admin_wallet_on_purchase();

CREATE TRIGGER trg_wallet_credit_on_ticket_update
AFTER UPDATE OF payment_status ON public.event_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_admin_wallet_on_purchase();

-- 5) Backfill credits for existing completed tickets, then recompute wallets
INSERT INTO public.admin_wallet_credits(ticket_id, event_id, admin_id, amount_naira)
SELECT 
  et.id AS ticket_id,
  et.event_id,
  e.host_id AS admin_id,
  (COALESCE(tt.organizer_receives, et.price) / 100)::int AS amount_naira
FROM public.event_tickets et
JOIN public.events e ON e.id = et.event_id
LEFT JOIN public.ticket_types tt ON tt.id = et.ticket_type_id
WHERE et.payment_status = 'completed'
ON CONFLICT (ticket_id) DO NOTHING;

-- Recompute wallet totals from credits
WITH sums AS (
  SELECT admin_id, event_id, SUM(amount_naira)::int AS total_naira
  FROM public.admin_wallet_credits
  GROUP BY admin_id, event_id
)
INSERT INTO public.admin_wallets(admin_id, event_id, total_earnings, available_balance)
SELECT s.admin_id, s.event_id, s.total_naira, s.total_naira
FROM sums s
LEFT JOIN public.admin_wallets w ON w.admin_id = s.admin_id AND w.event_id = s.event_id
WHERE w.id IS NULL;

WITH sums AS (
  SELECT admin_id, event_id, SUM(amount_naira)::int AS total_naira
  FROM public.admin_wallet_credits
  GROUP BY admin_id, event_id
)
UPDATE public.admin_wallets w
SET 
  total_earnings = s.total_naira,
  available_balance = GREATEST(s.total_naira - w.withdrawn_amount, 0),
  updated_at = now()
FROM sums s
WHERE w.admin_id = s.admin_id AND w.event_id = s.event_id;

COMMIT;