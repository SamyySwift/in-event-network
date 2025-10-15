-- Add difficulty and theme columns to word_search_games table
ALTER TABLE word_search_games
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS hints_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS time_limit INTEGER;