-- Fix double-credited admin wallet amounts by recomputing from ticket sales
-- Assumptions:
-- - event_tickets.price and ticket_types.organizer_receives are stored in kobo
-- - admin_wallets stores amounts in naira
-- - Only tickets with payment_status = 'completed' should count toward revenue

-- Recompute total_earnings and available_balance from tickets
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
  total_earnings = COALESCE(r.amount_kobo, 0) / 100,
  available_balance = GREATEST(0, COALESCE(r.amount_kobo, 0) / 100 - w.withdrawn_amount),
  updated_at = now()
FROM revenue r
WHERE w.admin_id = r.admin_id AND w.event_id = r.event_id;