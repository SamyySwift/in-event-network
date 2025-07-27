-- Fix minimum withdrawal amount from ₦100,000 to ₦10 (1000 kobo)
UPDATE admin_wallets SET minimum_payout_amount = 1000 WHERE minimum_payout_amount = 100000;

-- Set default minimum payout amount for new wallets to ₦10 (1000 kobo)
ALTER TABLE admin_wallets ALTER COLUMN minimum_payout_amount SET DEFAULT 1000;