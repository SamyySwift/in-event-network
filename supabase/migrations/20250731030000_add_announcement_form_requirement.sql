-- Add vendor_form_id and require_submission to announcements
ALTER TABLE public.announcements
ADD COLUMN IF NOT EXISTS vendor_form_id uuid NULL REFERENCES public.vendor_forms(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS require_submission boolean NOT NULL DEFAULT false;

-- Optional index for quick filtering
CREATE INDEX IF NOT EXISTS idx_announcements_vendor_form_id ON public.announcements(vendor_form_id);
CREATE INDEX IF NOT EXISTS idx_announcements_require_submission ON public.announcements(require_submission);