-- Add live stream columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS live_stream_url text,
ADD COLUMN IF NOT EXISTS is_live boolean DEFAULT false;