-- Word Search Leaderboard: tables, RLS, indexes, realtime

-- 1) Games table
CREATE TABLE IF NOT EXISTS public.word_search_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title text NOT NULL,
  words text[] NOT NULL,
  grid_size integer NOT NULL,
  grid_data jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  difficulty text,
  theme text,
  hints_enabled boolean DEFAULT false,
  time_limit integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.word_search_games ENABLE ROW LEVEL SECURITY;

-- Hosts can manage games for their events
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'word_search_games' AND policyname = 'Hosts can manage games for their events'
  ) THEN
    CREATE POLICY "Hosts can manage games for their events"
    ON public.word_search_games
    FOR ALL
    USING (public.is_event_owner(event_id))
    WITH CHECK (public.is_event_owner(event_id));
  END IF;
END $$;

-- Participants and hosts can view games for their events
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'word_search_games' AND policyname = 'Participants/hosts can view games for their events'
  ) THEN
    CREATE POLICY "Participants/hosts can view games for their events"
    ON public.word_search_games
    FOR SELECT
    USING (public.can_access_event_data(event_id) OR public.is_event_owner(event_id));
  END IF;
END $$;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_word_search_games'
  ) THEN
    CREATE TRIGGER set_updated_at_word_search_games
    BEFORE UPDATE ON public.word_search_games
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;


-- 2) Scores table
CREATE TABLE IF NOT EXISTS public.word_search_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.word_search_games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_seconds integer NOT NULL CHECK (time_seconds >= 0),
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (game_id, user_id)
);

ALTER TABLE public.word_search_scores ENABLE ROW LEVEL SECURITY;

-- View scores if participant/host of the game event
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'word_search_scores' AND policyname = 'Participants/hosts can view scores for game event'
  ) THEN
    CREATE POLICY "Participants/hosts can view scores for game event"
    ON public.word_search_scores
    FOR SELECT
    USING (
      public.can_access_event_data((SELECT wsg.event_id FROM public.word_search_games wsg WHERE wsg.id = word_search_scores.game_id))
      OR
      public.is_event_owner((SELECT wsg.event_id FROM public.word_search_games wsg WHERE wsg.id = word_search_scores.game_id))
    );
  END IF;
END $$;

-- Insert only own score and only if participant of the event
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'word_search_scores' AND policyname = 'Users can insert their own score'
  ) THEN
    CREATE POLICY "Users can insert their own score"
    ON public.word_search_scores
    FOR INSERT
    WITH CHECK (
      auth.uid() = user_id
      AND public.can_access_event_data((SELECT wsg.event_id FROM public.word_search_games wsg WHERE wsg.id = word_search_scores.game_id))
    );
  END IF;
END $$;

-- Update only own score and only if participant of the event
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'word_search_scores' AND policyname = 'Users can update their own score'
  ) THEN
    CREATE POLICY "Users can update their own score"
    ON public.word_search_scores
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
      auth.uid() = user_id
      AND public.can_access_event_data((SELECT wsg.event_id FROM public.word_search_games wsg WHERE wsg.id = word_search_scores.game_id))
    );
  END IF;
END $$;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_word_search_scores'
  ) THEN
    CREATE TRIGGER set_updated_at_word_search_scores
    BEFORE UPDATE ON public.word_search_scores
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Helpful indexes for ranking
CREATE INDEX IF NOT EXISTS idx_word_search_scores_game_time ON public.word_search_scores (game_id, time_seconds, completed_at);
CREATE INDEX IF NOT EXISTS idx_word_search_scores_game ON public.word_search_scores (game_id);

-- Enable realtime on scores
ALTER TABLE public.word_search_scores REPLICA IDENTITY FULL;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'word_search_scores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.word_search_scores;
  END IF;
END $$;
