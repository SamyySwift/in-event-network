-- Create table for tracking event access via referral codes
CREATE TABLE public.event_access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  access_code TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlocked_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_access_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Event hosts can view access codes for their events"
ON public.event_access_codes
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_access_codes.event_id 
  AND events.host_id = auth.uid()
));

CREATE POLICY "Authenticated users can create access code entries"
ON public.event_access_codes
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX idx_event_access_codes_event_id ON public.event_access_codes(event_id);
CREATE INDEX idx_event_access_codes_access_code ON public.event_access_codes(access_code);