-- Create quiz_games table
CREATE TABLE public.quiz_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  total_questions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_game_id UUID NOT NULL REFERENCES public.quiz_games(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  time_limit INTEGER NOT NULL DEFAULT 20,
  question_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_responses table
CREATE TABLE public.quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_game_id UUID NOT NULL REFERENCES public.quiz_games(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz_scores table
CREATE TABLE public.quiz_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_game_id UUID NOT NULL REFERENCES public.quiz_games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_time INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quiz_game_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.quiz_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_games
CREATE POLICY "Event hosts can manage quiz games for their events"
  ON public.quiz_games FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = quiz_games.event_id
      AND events.host_id = auth.uid()
    )
  );

CREATE POLICY "Event participants can view active quiz games"
  ON public.quiz_games FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.event_participants
      WHERE event_participants.event_id = quiz_games.event_id
      AND event_participants.user_id = auth.uid()
    )
  );

-- RLS Policies for quiz_questions
CREATE POLICY "Event hosts can manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_games qg
      JOIN public.events e ON e.id = qg.event_id
      WHERE qg.id = quiz_questions.quiz_game_id
      AND e.host_id = auth.uid()
    )
  );

CREATE POLICY "Event participants can view questions from active quizzes"
  ON public.quiz_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_games qg
      JOIN public.event_participants ep ON ep.event_id = qg.event_id
      WHERE qg.id = quiz_questions.quiz_game_id
      AND qg.is_active = true
      AND ep.user_id = auth.uid()
    )
  );

-- RLS Policies for quiz_responses
CREATE POLICY "Users can insert their own responses"
  ON public.quiz_responses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own responses"
  ON public.quiz_responses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Event hosts can view all responses for their quiz games"
  ON public.quiz_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_games qg
      JOIN public.events e ON e.id = qg.event_id
      WHERE qg.id = quiz_responses.quiz_game_id
      AND e.host_id = auth.uid()
    )
  );

-- RLS Policies for quiz_scores
CREATE POLICY "Users can insert their own scores"
  ON public.quiz_scores FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own scores"
  ON public.quiz_scores FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Event participants can view all scores in their events"
  ON public.quiz_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_games qg
      JOIN public.event_participants ep ON ep.event_id = qg.event_id
      WHERE qg.id = quiz_scores.quiz_game_id
      AND (ep.user_id = auth.uid() OR qg.is_active = true)
    )
  );

-- Indexes for performance
CREATE INDEX idx_quiz_games_event_id ON public.quiz_games(event_id);
CREATE INDEX idx_quiz_questions_quiz_game_id ON public.quiz_questions(quiz_game_id);
CREATE INDEX idx_quiz_responses_quiz_game_id ON public.quiz_responses(quiz_game_id);
CREATE INDEX idx_quiz_responses_user_id ON public.quiz_responses(user_id);
CREATE INDEX idx_quiz_scores_quiz_game_id ON public.quiz_scores(quiz_game_id);
CREATE INDEX idx_quiz_scores_user_id ON public.quiz_scores(user_id);

-- Enable realtime for quiz_scores
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_scores;