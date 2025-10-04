-- Add theme customization fields to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS custom_title TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0EA5E9',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#8B5CF6',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#10B981',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#1F2937';

-- Add comment explaining the theme fields
COMMENT ON COLUMN public.events.custom_title IS 'Custom event title/brand name shown to attendees';
COMMENT ON COLUMN public.events.primary_color IS 'Primary theme color (hex format)';
COMMENT ON COLUMN public.events.secondary_color IS 'Secondary theme color (hex format)';
COMMENT ON COLUMN public.events.accent_color IS 'Accent theme color (hex format)';
COMMENT ON COLUMN public.events.background_color IS 'Background color (hex format)';
COMMENT ON COLUMN public.events.text_color IS 'Text color (hex format)';