-- Create a public function to get attendance counts for events
CREATE OR REPLACE FUNCTION public.get_event_attendance_count(event_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM public.event_tickets
  WHERE event_id = event_uuid
    AND payment_status = 'completed';
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.get_event_attendance_count(uuid) TO anon;