-- Create sponsor_form_fields table
CREATE TABLE public.sponsor_form_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'tel', 'url', 'textarea', 'select', 'checkboxes', 'date', 'time', 'file', 'number')),
  label TEXT NOT NULL,
  placeholder TEXT,
  helper_text TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  field_order INTEGER NOT NULL DEFAULT 0,
  field_options JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sponsor_form_fields ENABLE ROW LEVEL SECURITY;

-- Create policies for sponsor form fields
CREATE POLICY "Event hosts can manage form fields for their events"
ON public.sponsor_form_fields
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM sponsor_forms sf
    JOIN events e ON e.id = sf.event_id
    WHERE sf.id = sponsor_form_fields.form_id
    AND e.host_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view active form fields"
ON public.sponsor_form_fields
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM sponsor_forms sf
    WHERE sf.id = sponsor_form_fields.form_id
    AND sf.is_active = true
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sponsor_form_fields_updated_at
BEFORE UPDATE ON public.sponsor_form_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_sponsor_form_fields_updated_at();