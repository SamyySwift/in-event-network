-- Create highlights table
CREATE TABLE public.highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  cover_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create highlight_media table for storing multiple media items per highlight
CREATE TABLE public.highlight_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  highlight_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_order INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlight_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for highlights
CREATE POLICY "Event hosts can manage highlights for their events"
ON public.highlights
FOR ALL
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = highlights.event_id 
  AND events.host_id = auth.uid()
));

CREATE POLICY "Everyone can view published highlights"
ON public.highlights
FOR SELECT
USING (is_published = true);

-- RLS Policies for highlight_media
CREATE POLICY "Event hosts can manage highlight media for their events"
ON public.highlight_media
FOR ALL
USING (EXISTS (
  SELECT 1 FROM highlights h
  JOIN events e ON e.id = h.event_id
  WHERE h.id = highlight_media.highlight_id 
  AND e.host_id = auth.uid()
));

CREATE POLICY "Everyone can view media from published highlights"
ON public.highlight_media
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM highlights h
  WHERE h.id = highlight_media.highlight_id 
  AND h.is_published = true
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_highlights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_highlights_updated_at
BEFORE UPDATE ON public.highlights
FOR EACH ROW
EXECUTE FUNCTION public.update_highlights_updated_at();