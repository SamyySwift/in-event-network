-- Add font family field to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Geist';

-- Add comment for documentation
COMMENT ON COLUMN public.events.font_family IS 'Custom font family for the event theme (e.g., Geist, Inter, Roboto)';