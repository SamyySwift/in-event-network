
-- Create event_payments table to track payment status for events
CREATE TABLE public.event_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount in kobo (smallest currency unit)
  currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  paystack_reference VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id) -- One payment per user per event
);

-- Enable RLS
ALTER TABLE public.event_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own payments" ON public.event_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON public.event_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON public.event_payments
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_event_payments_user_event ON public.event_payments(user_id, event_id);
CREATE INDEX idx_event_payments_reference ON public.event_payments(paystack_reference);

-- Add trigger to update updated_at
CREATE TRIGGER update_event_payments_updated_at
  BEFORE UPDATE ON public.event_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
