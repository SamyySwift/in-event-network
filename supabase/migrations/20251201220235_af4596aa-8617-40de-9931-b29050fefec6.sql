-- Add public read policy for schedule_items so guests can view schedules
CREATE POLICY "Public can view schedule items"
ON public.schedule_items
FOR SELECT
USING (true);