-- 1) Ensure RLS is enabled for secure access control
ALTER TABLE public.word_search_scores ENABLE ROW LEVEL SECURITY;

-- 2) Updated-at trigger to keep timestamps consistent during UPSERT updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_word_search_scores_updated_at'
  ) THEN
    -- nothing, already present
    NULL;
  ELSE
    CREATE TRIGGER set_word_search_scores_updated_at
    BEFORE UPDATE ON public.word_search_scores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3) Policies: allow event participants to insert/update their own score and view scores for games in their event
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'word_search_scores' AND policyname = 'wss_select_event_participants'
  ) THEN
    CREATE POLICY wss_select_event_participants
    ON public.word_search_scores
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.word_search_games g
        JOIN public.event_participants ep ON ep.event_id = g.event_id
        WHERE g.id = word_search_scores.game_id
          AND ep.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'word_search_scores' AND policyname = 'wss_insert_self_if_participant'
  ) THEN
    CREATE POLICY wss_insert_self_if_participant
    ON public.word_search_scores
    FOR INSERT
    WITH CHECK (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1
        FROM public.word_search_games g
        JOIN public.event_participants ep ON ep.event_id = g.event_id
        WHERE g.id = word_search_scores.game_id
          AND ep.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'word_search_scores' AND policyname = 'wss_update_self_if_participant'
  ) THEN
    CREATE POLICY wss_update_self_if_participant
    ON public.word_search_scores
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- 4) Realtime: ensure full row replication (idempotent if already set)
ALTER TABLE public.word_search_scores REPLICA IDENTITY FULL;