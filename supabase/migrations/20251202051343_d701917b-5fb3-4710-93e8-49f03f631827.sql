-- Add play_mode column to quiz_games table
ALTER TABLE quiz_games 
ADD COLUMN play_mode text DEFAULT 'admin_directed' NOT NULL;

-- Add constraint to ensure valid values
ALTER TABLE quiz_games
ADD CONSTRAINT quiz_games_play_mode_check 
CHECK (play_mode IN ('admin_directed', 'self_paced'));