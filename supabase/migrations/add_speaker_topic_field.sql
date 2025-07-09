-- Add topic column to speakers table
ALTER TABLE public.speakers ADD COLUMN IF NOT EXISTS topic TEXT;