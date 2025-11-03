-- Create quiz sessions table to track live quiz state
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_game_id UUID NOT NULL REFERENCES public.quiz_games(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  current_question_index INTEGER NOT NULL DEFAULT -1,
  is_active BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Event hosts can manage quiz sessions for their events
CREATE POLICY "Event hosts can manage quiz sessions"
ON public.quiz_sessions
FOR ALL
USING (EXISTS (
  SELECT 1 FROM events
  WHERE events.id = quiz_sessions.event_id
  AND events.host_id = auth.uid()
));

-- Event participants can view active quiz sessions
CREATE POLICY "Event participants can view quiz sessions"
ON public.quiz_sessions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM event_participants ep
  WHERE ep.event_id = quiz_sessions.event_id
  AND ep.user_id = auth.uid()
));

-- Enable realtime
ALTER TABLE public.quiz_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_sessions;