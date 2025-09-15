BEGIN;

-- 1) Points table (per-event, per-user)
CREATE TABLE IF NOT EXISTS public.chat_participation_points (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

-- 2) RLS
ALTER TABLE public.chat_participation_points ENABLE ROW LEVEL SECURITY;

-- Event participants (or host) can see points for their event
CREATE POLICY chat_points_select_for_event_members
ON public.chat_participation_points
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = chat_participation_points.event_id
      AND e.host_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.event_participants ep
    WHERE ep.event_id = chat_participation_points.event_id
      AND ep.user_id = auth.uid()
  )
);

-- Users can insert their own row if they are a host/participant of the event
CREATE POLICY chat_points_insert_self_if_event_member
ON public.chat_participation_points
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = chat_participation_points.event_id
        AND e.host_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.event_participants ep
      WHERE ep.event_id = chat_participation_points.event_id
        AND ep.user_id = auth.uid()
    )
  )
);

-- Users can update their own points if they are a host/participant of the event
CREATE POLICY chat_points_update_self_if_event_member
ON public.chat_participation_points
FOR UPDATE
USING (
  user_id = auth.uid()
  AND (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = chat_participation_points.event_id
        AND e.host_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.event_participants ep
      WHERE ep.event_id = chat_participation_points.event_id
        AND ep.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = chat_participation_points.event_id
        AND e.host_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.event_participants ep
      WHERE ep.event_id = chat_participation_points.event_id
        AND ep.user_id = auth.uid()
    )
  )
);

-- 3) Trigger to increment on every chat message
CREATE OR REPLACE FUNCTION public.increment_chat_points()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.chat_participation_points AS cpp (event_id, user_id, points, updated_at)
  VALUES (NEW.event_id, NEW.user_id, 1, now())
  ON CONFLICT (event_id, user_id) DO UPDATE
    SET points = cpp.points + 1,
        updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_increment_chat_points ON public.chat_messages;
CREATE TRIGGER trigger_increment_chat_points
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.increment_chat_points();

COMMIT;