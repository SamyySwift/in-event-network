-- Create word search games table
CREATE TABLE public.word_search_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  words TEXT[] NOT NULL,
  grid_size INTEGER NOT NULL DEFAULT 15,
  grid_data JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create word search scores table
CREATE TABLE public.word_search_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.word_search_games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  time_seconds INTEGER NOT NULL,
  points INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- Enable RLS
ALTER TABLE public.word_search_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_search_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for word_search_games
CREATE POLICY "Event hosts can manage word search games"
ON public.word_search_games
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.events
  WHERE events.id = word_search_games.event_id
  AND events.host_id = auth.uid()
));

CREATE POLICY "Event participants can view active games"
ON public.word_search_games
FOR SELECT
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.event_participants
    WHERE event_participants.event_id = word_search_games.event_id
    AND event_participants.user_id = auth.uid()
  )
);

-- RLS Policies for word_search_scores
CREATE POLICY "Users can insert their own scores"
ON public.word_search_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view scores for games they can access"
ON public.word_search_scores
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.word_search_games wsg
  JOIN public.event_participants ep ON ep.event_id = wsg.event_id
  WHERE wsg.id = word_search_scores.game_id
  AND ep.user_id = auth.uid()
));

CREATE POLICY "Event hosts can view all scores for their games"
ON public.word_search_scores
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.word_search_games wsg
  JOIN public.events e ON e.id = wsg.event_id
  WHERE wsg.id = word_search_scores.game_id
  AND e.host_id = auth.uid()
));

-- Add indexes for performance
CREATE INDEX idx_word_search_games_event_id ON public.word_search_games(event_id);
CREATE INDEX idx_word_search_scores_game_id ON public.word_search_scores(game_id);
CREATE INDEX idx_word_search_scores_points ON public.word_search_scores(points DESC);