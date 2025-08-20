-- Enable RLS on admin_wallet_credits table
ALTER TABLE public.admin_wallet_credits ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view their own wallet credits
CREATE POLICY "Admins can view their own wallet credits"
ON public.admin_wallet_credits
FOR SELECT
USING (admin_id = auth.uid());

-- Policy: System can insert wallet credits (for ticket purchases)
CREATE POLICY "System can insert wallet credits"
ON public.admin_wallet_credits
FOR INSERT
WITH CHECK (true);

-- Policy: Super admins can view all wallet credits (for administrative oversight)
CREATE POLICY "Super admins can view all wallet credits"
ON public.admin_wallet_credits
FOR SELECT
USING (is_super_admin());