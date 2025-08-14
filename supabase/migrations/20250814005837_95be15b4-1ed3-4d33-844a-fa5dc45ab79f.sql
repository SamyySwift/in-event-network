-- Make user_id nullable in event_payments table for guest purchases
ALTER TABLE public.event_payments ALTER COLUMN user_id DROP NOT NULL;