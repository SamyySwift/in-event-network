CREATE OR REPLACE FUNCTION public.get_admin_event_connections(admin_event_ids uuid[])
RETURNS TABLE(connection_count bigint) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH admin_participants AS (
    SELECT DISTINCT ep.user_id 
    FROM event_participants ep 
    WHERE ep.event_id = ANY(admin_event_ids)
  )
  SELECT COUNT(*)::bigint as connection_count
  FROM connections c
  JOIN admin_participants ap1 ON c.requester_id = ap1.user_id
  JOIN admin_participants ap2 ON c.recipient_id = ap2.user_id
  WHERE c.status = 'accepted';
END;
$$;