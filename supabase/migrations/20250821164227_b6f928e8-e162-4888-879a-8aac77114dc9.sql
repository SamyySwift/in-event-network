-- Create vendor form fields table
CREATE TABLE IF NOT EXISTS public.vendor_form_fields (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id uuid NOT NULL REFERENCES public.vendor_forms(id) ON DELETE CASCADE,
  field_id text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL,
  is_required boolean NOT NULL DEFAULT false,
  placeholder text,
  field_description text,
  field_options jsonb,
  validation_rules jsonb,
  field_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create vendor submissions table
CREATE TABLE IF NOT EXISTS public.vendor_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id uuid NOT NULL REFERENCES public.vendor_forms(id) ON DELETE CASCADE,
  vendor_name text NOT NULL,
  vendor_email text NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  notes text,
  ip_address inet,
  user_agent text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.vendor_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendor_form_fields
CREATE POLICY "Event hosts can manage vendor form fields for their events" 
ON public.vendor_form_fields FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_forms vf
    JOIN public.events e ON e.id = vf.event_id
    WHERE vf.id = vendor_form_fields.form_id 
    AND e.host_id = auth.uid()
  )
);

-- Create RLS policies for vendor_submissions
CREATE POLICY "Event hosts can view vendor submissions for their events" 
ON public.vendor_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_forms vf
    JOIN public.events e ON e.id = vf.event_id
    WHERE vf.id = vendor_submissions.form_id 
    AND e.host_id = auth.uid()
  )
);

CREATE POLICY "Anyone can create vendor submissions" 
ON public.vendor_submissions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Event hosts can update vendor submissions for their events" 
ON public.vendor_submissions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_forms vf
    JOIN public.events e ON e.id = vf.event_id
    WHERE vf.id = vendor_submissions.form_id 
    AND e.host_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_form_fields_form_id ON public.vendor_form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_vendor_form_fields_order ON public.vendor_form_fields(form_id, field_order);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_form_id ON public.vendor_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_vendor_submissions_submitted_at ON public.vendor_submissions(submitted_at);

-- Create updated_at triggers
CREATE TRIGGER update_vendor_form_fields_updated_at
    BEFORE UPDATE ON public.vendor_form_fields
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_submissions_updated_at
    BEFORE UPDATE ON public.vendor_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();