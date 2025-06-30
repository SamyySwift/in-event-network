
-- Add bank account details to admin_wallets table
ALTER TABLE admin_wallets 
ADD COLUMN bank_name VARCHAR(100),
ADD COLUMN account_number VARCHAR(20),
ADD COLUMN account_name VARCHAR(100),
ADD COLUMN bank_code VARCHAR(10),
ADD COLUMN recipient_code VARCHAR(50),
ADD COLUMN is_bank_verified BOOLEAN DEFAULT false,
ADD COLUMN minimum_payout_amount INTEGER DEFAULT 100000; -- 1000 NGN in kobo

-- Create withdrawal_requests table to track all withdrawal attempts
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_wallet_id UUID NOT NULL REFERENCES admin_wallets(id),
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  paystack_transfer_code VARCHAR(50),
  paystack_recipient_code VARCHAR(50),
  bank_name VARCHAR(100),
  account_number VARCHAR(20),
  account_name VARCHAR(100),
  failure_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for withdrawal_requests
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own withdrawal requests" ON withdrawal_requests
  FOR SELECT USING (
    admin_wallet_id IN (
      SELECT id FROM admin_wallets WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create withdrawal requests" ON withdrawal_requests
  FOR INSERT WITH CHECK (
    admin_wallet_id IN (
      SELECT id FROM admin_wallets WHERE admin_id = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
