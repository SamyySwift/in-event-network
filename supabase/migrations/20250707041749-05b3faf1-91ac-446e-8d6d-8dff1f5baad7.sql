-- Create sponsors table to store sponsor/partner submissions
CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  organization_name TEXT NOT NULL,
  contact_person_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  sponsorship_type TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_link TEXT,
  social_media_links JSONB DEFAULT '{}',
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_sponsors_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Create sponsor forms table to store form configurations
CREATE TABLE public.sponsor_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  form_title TEXT NOT NULL DEFAULT 'Sponsor & Partner Application',
  form_description TEXT,
  form_fields JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  shareable_link TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_sponsor_forms_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sponsors table
CREATE POLICY "Event hosts can manage their event sponsors"
ON public.sponsors
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = sponsors.event_id 
  AND events.host_id = auth.uid()
));

CREATE POLICY "Anyone can submit sponsor applications"
ON public.sponsors
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- RLS Policies for sponsor_forms table  
CREATE POLICY "Event hosts can manage their sponsor forms"
ON public.sponsor_forms
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = sponsor_forms.event_id 
  AND events.host_id = auth.uid()
));

CREATE POLICY "Anyone can view active sponsor forms"
ON public.sponsor_forms
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Add updated_at trigger for sponsors table
CREATE OR REPLACE FUNCTION public.update_sponsors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sponsors_updated_at
  BEFORE UPDATE ON public.sponsors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sponsors_updated_at();

-- Add updated_at trigger for sponsor_forms table
CREATE OR REPLACE FUNCTION public.update_sponsor_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sponsor_forms_updated_at
  BEFORE UPDATE ON public.sponsor_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sponsor_forms_updated_at();