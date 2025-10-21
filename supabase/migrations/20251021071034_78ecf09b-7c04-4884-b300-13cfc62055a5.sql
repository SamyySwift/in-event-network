-- Add foreign key relationship so PostgREST can join profiles in selects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'word_search_scores'
      AND c.conname = 'word_search_scores_user_id_fkey'
  ) THEN
    ALTER TABLE public.word_search_scores
      ADD CONSTRAINT word_search_scores_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Helpful indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_wss_game_time ON public.word_search_scores (game_id, time_seconds, completed_at);
CREATE INDEX IF NOT EXISTS idx_wss_user ON public.word_search_scores (user_id);

-- Ensure realtime sends full row data
ALTER TABLE public.word_search_scores REPLICA IDENTITY FULL;