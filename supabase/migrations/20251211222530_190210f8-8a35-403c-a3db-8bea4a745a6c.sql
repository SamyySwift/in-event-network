-- Add voice_note_url column to facilities table for voice descriptions
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS voice_note_url TEXT;