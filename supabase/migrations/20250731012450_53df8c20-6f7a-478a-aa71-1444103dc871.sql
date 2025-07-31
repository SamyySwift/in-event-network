-- Reset and recalculate admin wallet balances based on actual ticket sales
-- This fixes the currency conversion issue where balances were incorrectly stored

-- First, reset all wallet balances to zero
UPDATE admin_wallets 
SET 
  total_earnings = 0,
  available_balance = 0,
  updated_at = now();

-- Then recalculate balances based on completed ticket sales
WITH ticket_earnings AS (
  SELECT 
    e.host_id as admin_id,
    et.event_id,
    SUM(COALESCE(tt.organizer_receives, et.price)) as total_earnings
  FROM event_tickets et
  JOIN events e ON et.event_id = e.id
  LEFT JOIN ticket_types tt ON et.ticket_type_id = tt.id
  WHERE et.payment_status = 'completed'
  GROUP BY e.host_id, et.event_id
)
UPDATE admin_wallets 
SET 
  total_earnings = te.total_earnings,
  available_balance = te.total_earnings,
  updated_at = now()
FROM ticket_earnings te
WHERE admin_wallets.admin_id = te.admin_id 
  AND admin_wallets.event_id = te.event_id;