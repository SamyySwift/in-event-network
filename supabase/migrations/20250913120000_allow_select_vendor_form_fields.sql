-- Allow attendees to read vendor_form_fields for active forms
DROP POLICY IF EXISTS "Anyone can view vendor form fields for active forms" ON public.vendor_form_fields;

CREATE POLICY "Anyone can view vendor form fields for active forms"
ON public.vendor_form_fields FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.vendor_forms vf
    WHERE vf.id = vendor_form_fields.form_id
      AND vf.is_active = true
  )
);