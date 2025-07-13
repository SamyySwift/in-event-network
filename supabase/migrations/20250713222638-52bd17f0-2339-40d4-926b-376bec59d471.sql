-- Update sponsors table to support all three types: sponsors, partners, exhibitors
ALTER TABLE public.sponsors 
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'sponsor',
ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
ADD COLUMN IF NOT EXISTS call_number TEXT,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS facebook_link TEXT,
ADD COLUMN IF NOT EXISTS twitter_link TEXT,
ADD COLUMN IF NOT EXISTS linkedin_link TEXT;

-- Add constraint for category
ALTER TABLE public.sponsors 
DROP CONSTRAINT IF EXISTS check_sponsor_category;

ALTER TABLE public.sponsors 
ADD CONSTRAINT check_sponsor_category 
CHECK (category IN ('sponsor', 'partner', 'exhibitor'));

-- Update the table comment
COMMENT ON TABLE public.sponsors IS 'Table for storing sponsors, partners, and exhibitors information with products and contact details';

-- Create function to generate QR code data
CREATE OR REPLACE FUNCTION public.generate_sponsor_qr_data(sponsor_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    sponsor_data RECORD;
    qr_data TEXT;
BEGIN
    -- Get sponsor data
    SELECT organization_name, website_link, category 
    INTO sponsor_data 
    FROM public.sponsors 
    WHERE id = sponsor_id;
    
    -- Generate QR data (JSON format with key info)
    qr_data := json_build_object(
        'type', sponsor_data.category,
        'name', sponsor_data.organization_name,
        'website', COALESCE(sponsor_data.website_link, ''),
        'id', sponsor_id::text
    )::text;
    
    RETURN qr_data;
END;
$$;

-- Create trigger to auto-generate QR code data
CREATE OR REPLACE FUNCTION public.update_sponsor_qr_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.qr_code_data := generate_sponsor_qr_data(NEW.id);
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_sponsor_qr_code ON public.sponsors;

-- Create trigger for QR code generation
CREATE TRIGGER trigger_update_sponsor_qr_code
    BEFORE INSERT OR UPDATE ON public.sponsors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sponsor_qr_code();