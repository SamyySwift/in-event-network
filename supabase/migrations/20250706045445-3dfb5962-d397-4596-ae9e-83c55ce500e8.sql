-- Create function to increment wallet balance safely
CREATE OR REPLACE FUNCTION public.increment_wallet_balance(
  p_admin_id UUID,
  p_event_id UUID,
  p_amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert new wallet or update existing one
  INSERT INTO admin_wallets (admin_id, event_id, total_earnings, available_balance)
  VALUES (p_admin_id, p_event_id, p_amount, p_amount)
  ON CONFLICT (admin_id, event_id) 
  DO UPDATE SET 
    total_earnings = admin_wallets.total_earnings + p_amount,
    available_balance = admin_wallets.available_balance + p_amount,
    updated_at = now();
END;
$$;