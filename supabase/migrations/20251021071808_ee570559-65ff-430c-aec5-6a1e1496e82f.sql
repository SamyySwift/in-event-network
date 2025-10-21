-- Ensure timestamps exist to satisfy existing update triggers
ALTER TABLE public.word_search_scores
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.word_search_scores
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Ensure upsert target exists for onConflict: 'game_id,user_id'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'word_search_scores'
      AND c.conname = 'word_search_scores_game_user_key'
  ) THEN
    ALTER TABLE public.word_search_scores
      ADD CONSTRAINT word_search_scores_game_user_key UNIQUE (game_id, user_id);
  END IF;
END $$;
