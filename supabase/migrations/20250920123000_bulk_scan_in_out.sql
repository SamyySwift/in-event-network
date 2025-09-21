-- Bulk scan-in/out helpers for admin attendees page

CREATE OR REPLACE FUNCTION public.bulk_scan_out_attendees(target_event_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller uuid := auth.uid();
  updated_count integer;
BEGIN
  -- Ensure caller is the host of the event
  IF NOT EXISTS (
    SELECT 1 FROM events e WHERE e.id = target_event_id AND e.host_id = caller
  ) THEN
    RAISE EXCEPTION 'Access denied: not the host of this event';
  END IF;

  UPDATE profiles p
  SET current_event_id = NULL
  FROM event_participants ep
  WHERE p.id = ep.user_id
    AND ep.event_id = target_event_id
    AND p.current_event_id = target_event_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.bulk_scan_in_attendees(target_event_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller uuid := auth.uid();
  updated_count integer;
BEGIN
  -- Ensure caller is the host of the event
  IF NOT EXISTS (
    SELECT 1 FROM events e WHERE e.id = target_event_id AND e.host_id = caller
  ) THEN
    RAISE EXCEPTION 'Access denied: not the host of this event';
  END IF;

  UPDATE profiles p
  SET current_event_id = target_event_id
  FROM event_participants ep
  WHERE p.id = ep.user_id
    AND ep.event_id = target_event_id
    AND (p.current_event_id IS DISTINCT FROM target_event_id);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.bulk_scan_out_attendees(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bulk_scan_in_attendees(uuid) TO authenticated;