-- Enable real-time for questions table
ALTER TABLE public.questions REPLICA IDENTITY FULL;

-- Add questions table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;