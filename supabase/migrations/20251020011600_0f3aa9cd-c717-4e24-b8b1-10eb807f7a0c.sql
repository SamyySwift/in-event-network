-- Fix word_search_scores RLS policies to allow upsert
DROP POLICY IF EXISTS "Users can insert their own scores" ON public.word_search_scores;
DROP POLICY IF EXISTS "Users can view scores for games in their events" ON public.word_search_scores;

-- Allow users to insert their own scores if they're participants in the game's event
CREATE POLICY "Users can insert their own scores"
ON public.word_search_scores
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM word_search_games wsg
    JOIN event_participants ep ON ep.event_id = wsg.event_id
    WHERE wsg.id = word_search_scores.game_id
    AND ep.user_id = auth.uid()
  )
);

-- Allow users to update their own scores if they're participants in the game's event
CREATE POLICY "Users can update their own scores"
ON public.word_search_scores
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM word_search_games wsg
    JOIN event_participants ep ON ep.event_id = wsg.event_id
    WHERE wsg.id = word_search_scores.game_id
    AND ep.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM word_search_games wsg
    JOIN event_participants ep ON ep.event_id = wsg.event_id
    WHERE wsg.id = word_search_scores.game_id
    AND ep.user_id = auth.uid()
  )
);

-- Allow participants and hosts to view scores
CREATE POLICY "Users can view scores for games in their events"
ON public.word_search_scores
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM word_search_games wsg
    WHERE wsg.id = word_search_scores.game_id
    AND (
      wsg.event_id IN (
        SELECT event_id FROM event_participants WHERE user_id = auth.uid()
      )
      OR wsg.event_id IN (
        SELECT id FROM events WHERE host_id = auth.uid()
      )
    )
  )
);

-- Enable realtime for word_search_scores
ALTER TABLE public.word_search_scores REPLICA IDENTITY FULL;