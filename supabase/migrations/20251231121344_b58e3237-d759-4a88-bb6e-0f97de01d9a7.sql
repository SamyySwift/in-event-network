-- Add allow_multiple column to polls table for multi-select polls
ALTER TABLE polls ADD COLUMN IF NOT EXISTS allow_multiple boolean DEFAULT false;

-- Add voice_note_url column to announcements table
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS voice_note_url text;

-- Add has_seen_admin_guide column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_seen_admin_guide boolean DEFAULT false;