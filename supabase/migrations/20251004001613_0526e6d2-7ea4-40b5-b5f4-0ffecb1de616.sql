-- Create live_streams table to track broadcast sessions
CREATE TABLE IF NOT EXISTS public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live_stream_messages table for real-time chat during streams
CREATE TABLE IF NOT EXISTS public.live_stream_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live_stream_signals table for WebRTC signaling
CREATE TABLE IF NOT EXISTS public.live_stream_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL, -- 'offer', 'answer', 'ice-candidate'
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_streams
CREATE POLICY "Event hosts can manage their live streams"
  ON public.live_streams
  FOR ALL
  USING (host_id = auth.uid());

CREATE POLICY "Event participants can view active streams"
  ON public.live_streams
  FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.event_participants ep
      WHERE ep.event_id = live_streams.event_id
      AND ep.user_id = auth.uid()
    )
  );

-- RLS Policies for live_stream_messages
CREATE POLICY "Event participants can view stream messages"
  ON public.live_stream_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.event_participants ep ON ep.event_id = ls.event_id
      WHERE ls.id = live_stream_messages.stream_id
      AND ep.user_id = auth.uid()
    )
  );

CREATE POLICY "Event participants can send stream messages"
  ON public.live_stream_messages
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.event_participants ep ON ep.event_id = ls.event_id
      WHERE ls.id = live_stream_messages.stream_id
      AND ep.user_id = auth.uid()
      AND ls.is_active = true
    )
  );

-- RLS Policies for live_stream_signals
CREATE POLICY "Stream participants can manage signals"
  ON public.live_stream_signals
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.live_streams ls
      JOIN public.event_participants ep ON ep.event_id = ls.event_id
      WHERE ls.id = live_stream_signals.stream_id
      AND (ep.user_id = auth.uid() OR ls.host_id = auth.uid())
    )
  );

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_stream_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_stream_signals;

-- Create indexes for better performance
CREATE INDEX idx_live_streams_event_id ON public.live_streams(event_id);
CREATE INDEX idx_live_streams_is_active ON public.live_streams(is_active);
CREATE INDEX idx_live_stream_messages_stream_id ON public.live_stream_messages(stream_id);
CREATE INDEX idx_live_stream_signals_stream_id ON public.live_stream_signals(stream_id);