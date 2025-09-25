-- Fix chat message real-time delivery issues
-- Ensure REPLICA IDENTITY FULL for complete row data during updates
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_participation_points REPLICA IDENTITY FULL;